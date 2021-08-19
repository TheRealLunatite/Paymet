import { CommandInteraction, MessageEmbed } from "discord.js";
import { TOKENS } from "src/di";
import { autoInjectable, inject } from "tsyringe";
import { SlashCommand } from "@discordbot/types"
import { CartModule } from "@modules/cartDb/types";
import { DiscordId } from "@common/discordId";
import { PriceModule } from "@modules/priceDb/types";
import { InstanceModule } from "@modules/instanceDb/types";
import { Id } from "@common/id";

@autoInjectable()
export class ViewCartCommand implements SlashCommand {
    name = "viewcart"
    description = "View your cart."
    options = []
    defaultPermission = true
    permissions = []

    constructor(
        @inject(TOKENS.modules.cartDb) private cartDb? : CartModule,
        @inject(TOKENS.modules.priceDb) private priceDb? : PriceModule,
        @inject(TOKENS.modules.instanceDb) private instanceDb? : InstanceModule,
        @inject(TOKENS.values.discordMessageEmbed) private embed? : typeof MessageEmbed,
    ) {}
    
    // Split an array to <num> in length.
    private splitArray<T>(arr : T[] , num : number) : T[][] {
        const amountOfSections = Math.floor(arr.length / num)
    
        const sections = []

        for(let i = 0; i < amountOfSections; i++) {
            sections.push(arr.splice(0,num))
        }

        // Sections var should contain arrays that equal <num> array length.
        // The array var should be left with the items that couldn't be seperated into an array of length <num>.
        return [...sections , arr]
    }

    async execute(interaction : CommandInteraction): Promise<void> {
        const discordId = new DiscordId(interaction.user.id)
        const inventory = new Map<Id , InventoryItem[]>()
        
        let cartUser = await this.cartDb!.findOne({ discordId })
        let subTotal = 0

        // If the cart database doesn't contain cart data on the user who ran this command.
        if(!cartUser) {
            cartUser = await this.cartDb!.add({
                discordId,
                cart : []
            })
        }

        const cart = cartUser.cart

        if(cart.length === 0) {
            return interaction.reply({
                content : "You have an empty cart.",
                ephemeral : true
            })
        }

        // Get the inventory(s) for each placeId.
        for(let i = 0; i < cart.length; i++) {
            const { placeId } = cart[i]
            if(inventory.has(placeId)) {
                continue
            }

            const instance = await this.instanceDb!.findOne({ placeId })

            if(!instance) {
                // Remove the item from the user cart.
                cart.splice(i , 1)
                continue
            }   

            inventory.set(placeId , instance.inventory)
        }

        // If the inventory size is 0 that means all the items in the cart are unable to be purchased at the moment.
        if(inventory.size === 0) {
            // If the user has items in their cart.
            if(cart.length > 0) {
                // Empty the cart.
                await this.cartDb!.updateById(discordId , { cart : [] })
            }

            return interaction.reply({
                content : "Your items are unable to be purchase. I've cleared your inventory.",
                ephemeral : true
            })
        }

        for(let i = 0; i < cart.length; i++) {
            const { placeId , itemRawName , quantity } = cart[i]

            // There's already a check on line 66 to check if an socket instance exists for each corresponding placeId item.
            const placeInventory = inventory.get(placeId)!
            const findItemIndex = placeInventory.findIndex(({ itemRawName : inventoryItemRawName }) => itemRawName === inventoryItemRawName)

            // If the socket instance does not have the item in the inventory anymore.
            if(findItemIndex === -1) {
                cart.splice(i , 1)
                continue
            }

            // If the stock of the item is lower than the quantity.
            if(placeInventory[findItemIndex].itemStock < quantity) {
                cart.splice(i , 1)
                continue
            }

            const priceOfItem = await this.priceDb!.findOne({ itemName : itemRawName , itemPlaceId : placeId})

            // If the item is not enlisted for sale.
            if(!priceOfItem) {
                cart.splice(i , 1)
                continue
            }

            subTotal += quantity * priceOfItem.priceInRobux
        }   
        
        const sections = this.splitArray(cart , 5)

        // ! Need to display the total of each individual item in the embed.
        const embeds = sections.map((cartSection , index) => {
            let description = ""

            cartSection.forEach(({ itemRawName , quantity }) => {
                description += `Item : **${itemRawName}** | Quantity : **${quantity}** \n`
            })

            return new this.embed!()
            .setDescription(description)
            .setTitle(`Viewing ${interaction.user.tag}'s cart.`)
            .setFooter(`Page : ${index + 1} / ${sections.length}`)
            .setTimestamp()
            .setColor("RANDOM")
        })

        return interaction.reply({ 
            content : `Subtotal : ${subTotal} robux`,
            embeds
        })
    }
}