import { LoggerModule } from "@modules/logger/types";
import { Client } from "discord.js";
import { TOKENS } from "src/di";
import { autoInjectable, inject } from "tsyringe";
import { DiscordEventListener } from "../types";

@autoInjectable()
export class DiscordInteractionCreateEvent implements DiscordEventListener {
    constructor(
        @inject(TOKENS.modules.logger) private logger? : LoggerModule
    ) {}

    execute(client: Client): void {
        client.on("interactionCreate" , async (interaction) => {
            if(!interaction.isCommand()) {
                return
            }
            
            try {
                await client.slashCommands!.get(interaction.commandName)!.execute(interaction)
            } catch {
                this.logger!.error(`${interaction.commandName} slash command does not exist.`)
            }
        })
    }
}