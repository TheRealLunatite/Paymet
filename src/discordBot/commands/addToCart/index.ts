import { CommandInteraction } from "discord.js";
import { TOKENS } from "src/di";
import { autoInjectable, inject } from "tsyringe";
import { SlashCommand } from "@discordbot/types"
import { CartItem, CartModule } from "@modules/cartDb/types";
import { DiscordId } from "@common/discordId";
import { PriceModule } from "@modules/priceDb/types";
import { Id } from "@common/id";
import { InstanceModule } from "@modules/instanceDb/types";

@autoInjectable()
export class AddToCartCommand implements SlashCommand {
    name = "addtocart"
    description = "Add an item to your cart."
    options = [
        {
            name : "itemname",
            type : 3,
            description : "An item name.",
            required : true
        },
        {
            name : "placeid",   
            type : 4,
            description : "This item belongs to this placeId.",
            required : true
        },
        {
            name : "quantity",
            type : 4,
            description : "The quantity of the item you're willing to purchase.",
            required : true
        }
    ]
    defaultPermission = true
    permissions = []

    constructor(
        @inject(TOKENS.modules.cartDb) private cartDb? : CartModule,
        @inject(TOKENS.modules.priceDb) private priceDb? : PriceModule,
        @inject(TOKENS.modules.instanceDb) private instaceDb? : InstanceModule
    ) {}

    async execute(interaction : CommandInteraction): Promise<void> {
        const discordId = new DiscordId(interaction.user.id)
        const placeId = new Id(interaction.options.getInteger('placeid')!)
        const itemQuantity = interaction.options.getInteger('quantity')!
        const itemName = interaction.options.getString("itemname")!

        // lol troll
        if(itemQuantity <= 0) {
            return interaction.reply({
                content :`Successfully added 60962x \`\`${itemName}\`\` to cart.`,
                ephemeral : true
            })
        }

        let cartUser = await this.cartDb!.findOne({ discordId })

        // If the cart database doesn't contain cart data on the user who ran this command.
        if(!cartUser) {
            cartUser = await this.cartDb!.add({
                discordId,
                cart : []
            })
        }

        const cart = cartUser.cart
        const instance = await this.instaceDb!.findOne({ placeId })

        if(!instance) {
            return interaction.reply({
                content : `This is not an active place id to purchase items from.`,
                ephemeral : true
            })
        }

        const inventoryItem = instance.inventory.find(({ itemRawName }) => itemRawName === itemName)

        if(!inventoryItem) {
            return interaction.reply({
                content : `Our bot currently does not have an item named **${itemName}** in the inventory.`,
                ephemeral : true
            })
        }

        const enlistedItem = await this.priceDb!.findOne({ itemName })

        if(!enlistedItem) {
            return interaction.reply({
                content : "Unable to add to cart because it has not been enlisted for sale by the owner.",
                ephemeral : true
            })
        }

        if(inventoryItem.itemStock < itemQuantity) {
            return interaction.reply({
                content : "Quantity exceeds item stock.",
                ephemeral : true
            })
        }

        // Find the item index in the cart.
        const cartItemIndex = cart.findIndex((cartItem) => cartItem.itemPlaceId.value === placeId.value && cartItem.itemRawName === itemName)

        if(cartItemIndex !== -1) {
            const cartItem = cart[cartItemIndex]

            if(cartItem.itemQuantity + itemQuantity > inventoryItem.itemStock) {
                return interaction.reply({
                    content : `You can only have a total quantity of ${inventoryItem.itemStock} for this item.`,
                    ephemeral : true
                })
            } else {
                cart[cartItemIndex] = {
                    ...cartItem,
                    itemQuantity : cartItem.itemQuantity + inventoryItem.itemStock
                }

                await this.cartDb!.updateById(discordId , { cart })
            }
        } else {
            await this.cartDb!.updateById(discordId , {
                cart : [...cartUser.cart , { itemPlaceId: placeId , itemRawName : inventoryItem.itemRawName, itemQuantity , itemType : inventoryItem.itemType , itemRarity : inventoryItem.itemRarity }]
            })            
        }

        return interaction.reply(`Successfully added ${itemQuantity}x \`\`${itemName}\`\` to cart.`)
    }
}