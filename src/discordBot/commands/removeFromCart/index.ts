import { CommandInteraction } from "discord.js";
import { TOKENS } from "src/di";
import { autoInjectable, inject } from "tsyringe";
import { SlashCommand } from "@discordbot/types"
import { CartModule } from "@modules/cartDb/types";
import { DiscordId } from "@common/discordId";
import { Id } from "@common/id";

@autoInjectable()
export class RemoveFromCartCommand implements SlashCommand {
    name = "removefromcart"
    description = "Remove an item from your cart."
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
        }
    ]
    defaultPermission = true
    permissions = []

    constructor(
        @inject(TOKENS.modules.cartDb) private cartDb? : CartModule
    ) {}
    

    async execute(interaction : CommandInteraction): Promise<void> {
        const discordId = new DiscordId(interaction.user.id)
        const placeId = new Id(interaction.options.getInteger('placeid')!)
        const itemName = interaction.options.getString("itemname")!

        let cartUser = await this.cartDb!.findOne({ discordId })

        // If the cart database doesn't contain cart data on the user who ran this command.
        if(!cartUser) {
            cartUser = await this.cartDb!.add({
                discordId,
                cart : []
            })
        }

        const userCart = cartUser.cart

        if(userCart.length <= 0) {
            return interaction.reply({
                content : "You've an empty shopping cart.",
                ephemeral : true
            })
        }

        const findCartItem = userCart.findIndex(({ itemRawName , placeId : cartPlaceId }) => itemRawName === itemName && cartPlaceId === placeId.value)

        if(findCartItem === -1) {
            return interaction.reply({
                content : "This item is not in your cart.",
                ephemeral : true
            })
        }

        // Remove the cart item from the array.
        userCart.splice(findCartItem , 1)

        await this.cartDb!.updateById(discordId , { cart : userCart })

        return interaction.reply({
            content : `Successfully removed \`\`${itemName}\`\` from cart.`,
            ephemeral : true
        })

    }
}