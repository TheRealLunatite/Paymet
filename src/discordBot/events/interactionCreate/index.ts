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
                return interaction.reply({
                    content : `${interaction.commandName} slash command does not exist.`,
                    ephemeral : true
                })
            }

            try {
                await slashCommand.execute(interaction)
            } catch (e) {
                if(slashCommand.name === "checkout") {
                    client.isUserInCheckout = false
                }
                
                this.logger!.error(`${slashCommand.name} command : ${e.message}.`)
                await interaction.reply({
                    content : `There was an error running this command.`,
                    ephemeral : true
                })
            }
        })
    }
}