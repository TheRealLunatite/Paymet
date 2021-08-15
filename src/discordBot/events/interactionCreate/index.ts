import { Client } from "discord.js";
import { autoInjectable } from "tsyringe";
import { DiscordEventListener } from "@discordbot/types"

@autoInjectable()
export class DiscordInteractionCreateEvent implements DiscordEventListener {
    constructor() {}

    execute(client: Client): void {
        client.on("interactionCreate" , async (interaction) => {
            if(!interaction.isCommand()) {
                return
            }
            
            try {
                await client.slashCommands!.get(interaction.commandName)!.execute(interaction)
            } catch {
                await interaction.reply(`${interaction.commandName} slash command does not exist.`)
            }
        })
    }
}