import { CommandInteraction } from "discord.js";
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

@autoInjectable()
export class CheckoutCommand implements SlashCommand {
    name = "checkout"
    description = "Checkout your cart."
    options = []
    defaultPermission = true
    permissions = []

    constructor(
        @inject(TOKENS.modules.cartDb) private cartDb? : CartModule,
        @inject(TOKENS.modules.priceDb) private priceDb? : PriceModule,
        @inject(TOKENS.modules.instanceDb) private instanceDb? : InstanceModule,
        @inject(TOKENS.modules.roblox) private roblox? : RobloxModule,
        @inject(TOKENS.values.robloxConfig) private robloxConfig? : { cookie : string , assetId : number } 
    ) {}
    
    private async getInstancesInventoryByPlaceId(placeIds : Id[]) : Promise<Map<Id , InventoryItem[]>>{
        const inventory = new Map<Id , InventoryItem[]>()

        for(let i = 0; i < placeIds.length; i++) {
            const placeId = placeIds[i]
            // If the placeId already exists in the map.
            if(inventory.has(placeId)) {
                continue
            }

            const instance = await this.instanceDb!.findOne({ placeId })

            if(!instance) {
                continue
            }
            
            inventory.set(placeId , instance.inventory)
        }

        return inventory
    }

    private async getPriceOfCartItems(cart : CartItem[]) : Promise<CartItemWithPrice[]> {
        const priceOfCartItems : CartItemWithPrice[] = []
        
        for(let i = 0; i < cart.length; i++) {
            const cartItem = cart[i]
            const getPriceOfItem = await this.priceDb!.findOne({ itemName : cartItem.itemRawName , itemPlaceId : cartItem.placeId})

            if(!getPriceOfItem) {
                continue
            }

            priceOfCartItems.push({ ...cartItem , price : cartItem.quantity * getPriceOfItem.priceInRobux })
        }

        return priceOfCartItems
    }

    async execute(interaction : CommandInteraction): Promise<void> {
        const discordId = new DiscordId(interaction.user.id)
        const cookie = new Cookie(this.robloxConfig!.cookie)

        // Check cart.
        const userCart = await this.cartDb!.findOne({ discordId }) ?? await this.cartDb!.add({ discordId , cart : []})
        let cart = userCart.cart

        if(cart.length <= 0) {
            return interaction.reply({
                content : "Your cart is empty.",
                ephemeral : true
            })
        }

        const isAuthenticated = this.roblox!.isUserAuthenticated(cookie)

        if(!isAuthenticated) {
            return interaction.reply({
                content : "The owner has an invalid cookie and cannot perform this action at this time.",
                ephemeral : true
            })
        }

        if(!await this.roblox!.playerOwnsAsset(cookie , new Id(680062774) , new Id(this.robloxConfig!.assetId))) {
            return interaction.reply({
                content : "Please delete the asset from your inventory from the previous purchase to continue.",
                ephemeral : true
            })
        }

        // !Fix this shit.
        const inventory = await this.getInstancesInventoryByPlaceId(cart.map(({placeId}) => placeId))

        // If the inventory size is 0 means all items are unable to be purchased.
        if(inventory.size === 0) {
            await this.cartDb!.updateById(discordId , { cart : [] })
            
            return interaction.reply({
                content : `Items are unable to be purchased. I've cleared your inventory.`,
                ephemeral : true
            })
        }

        // Filter the cart if there is an active bot to purchase item from and the cart item is in inventory.
        cart = cart.filter(({ placeId , itemRawName : cartItemRawName , quantity }) => {
            inventory.has(placeId) && inventory.get(placeId)!.find(({ itemRawName , itemStock }) => itemRawName === cartItemRawName && itemStock <= quantity)
        })

        // Add a check here. 

        // Get the price of items.

        const cartItemsWithPrice = await this.getPriceOfCartItems(cart)
        const subTotal = cartItemsWithPrice.reduce((total , cartItem) => total + cartItem.price, 0)

        return interaction.reply(`Your subtotal is ${subTotal}.`)

        // Show the subtotal of the items and ask if the client to confirm the purchase.


    }
}