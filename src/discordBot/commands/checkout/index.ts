import { CollectorFilter, CommandInteraction , Message, MessageActionRow, MessageComponentInteraction  } from "discord.js";
import { TOKENS } from "src/di";
import { autoInjectable, inject } from "tsyringe";
import { SlashCommand } from "@discordbot/types"
import { CartItem, CartItemWithPrice, CartModule } from "@modules/cartDb/types";
import { DiscordId } from "@common/discordId";
import { PriceModule } from "@modules/priceDb/types";
import { Id } from "@common/id";
import { InstanceModule } from "@modules/instanceDb/types";
import { RobloxModule } from "@modules/roblox";
import { Cookie } from "@common/cookie";
import { InventoryData, LoadPurchasePrompt, PurchasePromptResponse } from "./types";
import { TransactionModule } from "@modules/transactionDb/types";
import { v4 } from "uuid"
import { Uuid } from "@common/uuid";
import { UserInfoByIdResponse } from "@modules/roblox/types";
import { Username } from "@common/username";

@autoInjectable()
export class CheckoutCommand implements SlashCommand {
    name = "checkout"
    description = "Checkout your cart."
    options = [
        {
            name : "userid",
            type : 4,
            description : "UserId must purchase an asset to complete the purchase.",
            required : true
        }
    ]
    defaultPermission = true
    permissions = []

    constructor(
        @inject(TOKENS.modules.cartDb) private cartDb? : CartModule,
        @inject(TOKENS.modules.priceDb) private priceDb? : PriceModule,
        @inject(TOKENS.modules.instanceDb) private instanceDb? : InstanceModule,
        @inject(TOKENS.modules.transactionDb) private transactionDb? : TransactionModule,
        @inject(TOKENS.modules.roblox) private roblox? : RobloxModule,
        @inject(TOKENS.values.uuid) private uuid? : typeof v4,
        @inject(TOKENS.values.robloxConfig) private robloxConfig? : { cookie : string , assetId : number } 
    ) {}
    
    private async getInstancesInventoryByPlaceId(placeIds : Id[]) : Promise<Map<number , InventoryData>>{
        const inventory = new Map<number , InventoryData>()

        for(let i = 0; i < placeIds.length; i++) {
            const placeId = placeIds[i]
            // If the placeId already exists in the map.
            if(inventory.has(placeId.value)) {
                continue
            }

            const instance = await this.instanceDb!.findOne({ placeId })

            if(!instance) {
                continue
            }
            
            inventory.set(placeId.value , { socketId : instance.socketId , inventory : instance.inventory , userId : instance.userId })
        }

        return inventory
    }

    private async getPriceOfCartItems(cart : CartItem[]) : Promise<CartItemWithPrice[]> {
        const priceOfCartItems : CartItemWithPrice[] = []
        
        for(let i = 0; i < cart.length; i++) {
            const cartItem = cart[i]
            const getPriceOfItem = await this.priceDb!.findOne({ itemName : cartItem.itemRawName , itemPlaceId : cartItem.itemPlaceId })

            if(!getPriceOfItem) {
                continue
            }

            priceOfCartItems.push({ ...cartItem , price : cartItem.itemQuantity * getPriceOfItem.priceInRobux })
        }

        return priceOfCartItems
    }

    private async updateInventory(inventorys : Map<number , InventoryData> , cart : Array<CartItemWithPrice | CartItem>) {
        for(let i = 0; i < cart.length; i++) {
            const cartItem = cart[i]  
            const { inventory , socketId } = inventorys.get(cartItem.itemPlaceId.value)!

            const findInventoryItemIndex = inventory.findIndex(({ itemRawName , itemRarity , itemType }) => itemRawName === cartItem.itemRawName && cartItem.itemType === itemType  && cartItem.itemRarity === itemRarity)
            
            if(findInventoryItemIndex === -1) {
                continue
            } 

            const inventoryItem = inventory[findInventoryItemIndex]

            // If the cart item quantity is the same as the item stock then we will remove it from the instance inventory.
            if(inventoryItem.itemStock === cartItem.itemQuantity) {
                inventory.splice(findInventoryItemIndex , 1)
            } else {
                // Update the inventory item stock by subtracting itemStock by quantity.
                inventory[findInventoryItemIndex] = {
                    ...inventoryItem,
                    itemStock : inventoryItem.itemStock - cartItem.itemQuantity
                }
            }

            this.instanceDb!.updateById(socketId , { inventory })
        }
    }

    private getPurhcasePromptButtons() {
        return new MessageActionRow().addComponents([
            {
                type : "BUTTON",
                customId : "confirm",
                style : "SUCCESS",
                label : "Confirm"
            },
            {
                type : "BUTTON",
                customId : "cancel",
                style : "DANGER",
                label : "Cancel"
            }
        ])
    }

    private setIsUserInCheckout(interaction : CommandInteraction , bool : boolean) {
        interaction.client.isUserInCheckout = bool
        return bool
    }

    private isUserInCheckout(interaction : CommandInteraction) {
        return interaction.client.isUserInCheckout
    }

    private async sendPurchasePrompt(opts : LoadPurchasePrompt) : Promise<PurchasePromptResponse> {
        return new Promise(async (resolve , reject) => {
            const { interaction , userId , assetId , cookie } = opts
            const expiresInSeconds = opts.expiresInSeconds ? opts.expiresInSeconds * 1000 : 1000 * 60 * 2

            const interactionMessage = await interaction.reply({
                content : `
                Please purchase the following asset to confirm your purchase.
                This purchase prompt will expire in \`\`${ expiresInSeconds / 1000}\`\` seconds.

                Click \`\`Confirm\`\` to confirm your purchase.
                Click \`\`Cancel\`\` if you want to cancel the purchase.
                
                https://www.roblox.com/catalog/${this.robloxConfig!.assetId}/PaymetPurchase`
                ,
                components : [this.getPurhcasePromptButtons()],
                fetchReply : true
            }) as Message

            const promptFilter : CollectorFilter<[MessageComponentInteraction]> = (collectorInteraction) => {
                return collectorInteraction.user.id === interaction.user.id &&
                (collectorInteraction.customId === "confirm" || collectorInteraction.customId === "cancel")
            }

            const messageCollector = await interactionMessage.createMessageComponentCollector({
                filter: promptFilter,
                dispose : true,
                time : expiresInSeconds,
                interactionType : "MESSAGE_COMPONENT"
            })

            messageCollector.on("collect" , async (collectorInteraction) => {
                switch(collectorInteraction.customId) {
                    case "cancel":
                        messageCollector.stop("cancel")
                        break
                    case "confirm":
                        if(await this.roblox!.playerOwnsAsset(cookie , userId , assetId)) {
                            messageCollector.stop("success")
                            break
                        }

                        await collectorInteraction.deferUpdate()
                        await collectorInteraction.editReply("You do not have this asset purchased at the moment.")
                        break
                    default:
                        break
                }
            })

            messageCollector.on("end" , async (collected , reason) => {                
                switch(reason) {
                    case "cancel":
                        resolve({ success : false , reason : "You've cancelled your purchase."})
                        break
                    case "success":
                        resolve({ success : true , reason : "Payment successful" })
                        break
                    default:
                        resolve({ success : false , reason : "An error occured while proccessing your payment."})
                        break
                }
            })
        })
    }

    private parseInventoryUserId(inventory : Map<number , InventoryData>) {
        const placeUrls = []
        const inventoryMapValues = inventory.values()
        let inventoryMapValue = inventoryMapValues.next()

        while(!inventoryMapValue.done) {
            placeUrls.push(`https://www.roblox.com/users/${inventoryMapValue.value.userId.value}/profile`)
            inventoryMapValue = inventoryMapValues.next()
        }

        return placeUrls
    }

    async execute(interaction : CommandInteraction): Promise<void> {
        if(this.isUserInCheckout(interaction)) {
            return interaction.reply({
                content : "Please try again later.  There is currently a user checking out their cart at the moment.",
                ephemeral : true
            })
        }

        this.setIsUserInCheckout(interaction , true)

        const userId = new Id(+interaction.options.getInteger("userid")!)
        const assetId = new Id(this.robloxConfig!.assetId)
        const discordId = new DiscordId(interaction.user.id)
        const cookie = new Cookie(this.robloxConfig!.cookie)
        let userInfo : UserInfoByIdResponse

        const isAuthenticated = this.roblox!.isUserAuthenticated(cookie)

        if(!isAuthenticated) {
            this.setIsUserInCheckout(interaction , false)

            return interaction.reply({
                content : `${interaction.user} The owner has an invalid cookie and cannot perform this action at this time.`,
                ephemeral : true
            })
        }

        // Check if the user exits.
        try {
            userInfo = await this.roblox!.getUserInfoById(cookie , userId)

            if(userInfo.isBanned) {
                this.setIsUserInCheckout(interaction , false)
                return interaction.reply({
                    content : `${interaction.user} This user is banned.`,
                    ephemeral : true
                })
            }            
        } catch {
            this.setIsUserInCheckout(interaction , false)
            return interaction.reply({
                content : `${interaction.user} You've provided an invalid userId.`,
                ephemeral : true
            })
        }

        if(await this.roblox!.playerOwnsAsset(cookie , userId , assetId)) {
            this.setIsUserInCheckout(interaction , false)
            return interaction.reply({
                content : "Please delete the asset from your inventory from the previous purchase to continue.",
                ephemeral : true
            })
        }

        const userCart = await this.cartDb!.findOne({ discordId }) ?? await this.cartDb!.add({ discordId , cart : [] })
        let cart = userCart.cart

        if(cart.length <= 0) {
            return interaction.reply({
                content : `${interaction.user} Your cart is empty.`,
                ephemeral : true
            })
        }

        const inventory = await this.getInstancesInventoryByPlaceId(cart.map(({itemPlaceId: placeId}) => placeId))

        // If the inventory size is 0 means all items are unable to be purchased.
        if(inventory.size <= 0) {
            await this.cartDb!.updateById(discordId , { cart : [] })
            this.setIsUserInCheckout(interaction , false)
            return interaction.reply({
                content : `${interaction.user} your items are unable to be purchased. I've cleared your inventory.`,
                ephemeral : true
            })
        }

        // Filter the cart if there is an active bot to purchase the item from and the quantity doesn't exceed the stock.
        cart = cart.filter(({ itemPlaceId: placeId , itemRawName : cartItemRawName , itemQuantity: quantity }) => {
            // If the cart item placeId cannot be located in the inventory map.
            if(!inventory.has(placeId.value)) {
                return false
            }

            const findItemInInventory = inventory.get(placeId.value)!.inventory!.find(({ itemRawName , itemStock }) => itemRawName === cartItemRawName && quantity <= itemStock)
            return findItemInInventory ? true : false
        })

        if(cart.length <= 0) {
            await this.cartDb!.updateById(discordId , { cart : [] })
            this.setIsUserInCheckout(interaction , false)
            return interaction.reply({
                content : `${interaction.user} Items are unable to be purchased. I've cleared your inventory.`,
                ephemeral : true
            })
        }

        // Get the price of items.
        const cartItemsWithPrice = await this.getPriceOfCartItems(cart)
        const subTotal = cartItemsWithPrice.reduce((total , cartItem) => total + cartItem.price, 0)

        if(!await this.roblox!.updateAssetPrice(cookie , assetId , subTotal)) {
            this.setIsUserInCheckout(interaction , false)
            return interaction.reply({
                content : `${interaction.user} Unable to configure the price of asset.`,
                ephemeral : true
            })
        }

        const isPurchaseSuccessful = await this.sendPurchasePrompt({
            interaction,
            userId,
            assetId,
            cookie
        })

        await interaction.deleteReply()

        await interaction.channel!.send({
            content :  `${interaction.user} ${isPurchaseSuccessful.reason}.`,
            components : []
        })

        if(!isPurchaseSuccessful.success) {
            this.setIsUserInCheckout(interaction , false)
            return
        }

        // Update each instance inventory to update items that have been purchased.    
        this.updateInventory(inventory , cart)

        // Create an transaction.
        await this.transactionDb!.add({
            id : new Uuid(this.uuid!()),
            username : new Username(userInfo!.name),
            status : "initalized",
            items : cart.map((cartItem) => ( { ...cartItem , itemReceived : false })),
            discordId
        })
    

        await this.cartDb!.updateById(discordId , { cart : [] })

        const userDMChannel = await interaction.user.createDM()
        await userDMChannel.send(this.parseInventoryUserId(inventory).toString())
        this.setIsUserInCheckout(interaction , false)
        return
    }
}