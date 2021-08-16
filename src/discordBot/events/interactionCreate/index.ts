import { Client } from "discord.js";
import { autoInjectable, inject } from "tsyringe";
import { DiscordEventListener } from "@discordbot/types"
import { TOKENS } from "src/di";
import { Logger } from "tslog";

@autoInjectable()
export class DiscordInteractionCreateEvent implements DiscordEventListener {
    constructor(
        @inject(TOKENS.modules.logger) private logger : Logger
    ) {}

    execute(client: Client): void {
        client.on("interactionCreate" , async (interaction) => {
            if(!interaction.isCommand()) {
                return
            }
            
            const slashCommand = client.slashCommands!.get(interaction.commandName)

            if(!slashCommand) {
                return interaction.reply(`${interaction.commandName} slash command does not exist.`)
            }

            try {
                await slashCommand.execute(interaction)
            } catch (e) {
                this.logger!.error(`${slashCommand.name} command : ${e.message}.`)
                await interaction.reply(`There was an error running this command.`)
            }
        })
    }
}