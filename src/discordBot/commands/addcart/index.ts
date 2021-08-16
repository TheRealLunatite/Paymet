import { CommandInteraction } from "discord.js";
import { TOKENS } from "src/di";
import { autoInjectable, inject } from "tsyringe";
import { SlashCommand } from "@discordbot/types"
import { CartModule } from "@modules/cartDb/types";
import { DiscordId } from "@common/discordId";

@autoInjectable()
export class AddPriceCommand implements SlashCommand {
    name = "addcart"
    description = "Add an item to your cart."
    options = []
    defaultPermission = true
    permissions = [
        {
            id : '573639162733789197',
            type : 2,
            permission : true
        }
    ]

    constructor(
        @inject(TOKENS.modules.cartDb) private cartDb? : CartModule
    ) {}
    

    async execute(interaction : CommandInteraction): Promise<void> {
        const discordId = new DiscordId(interaction.user.id)
        const cartUser = await this.cartDb!.findOne({ discordId })

        if(!cartUser) {
            await this.cartDb!.add({
                discordId,
                cart : []
            })
        }

        return interaction.reply("AHH")
    }
}