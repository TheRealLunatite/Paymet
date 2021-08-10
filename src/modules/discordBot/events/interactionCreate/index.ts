import { Client } from "discord.js";
import { autoInjectable } from "tsyringe";
import { DiscordEventListener } from "../types";

@autoInjectable()
export class DiscordInteractionCreateEvent implements DiscordEventListener {
    constructor(
    ) {}

    execute(client: Client): void {
        client.on("interactionCreate" , async (interaction) => {
            if(!interaction.isCommand()) {
                return
            }

            if(interaction.commandName === "addprice") {
                await client.slashCommands!.get("addprice")!.execute(interaction)
            }
        })
    }
}