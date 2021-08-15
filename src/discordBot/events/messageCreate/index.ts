import { Client } from "discord.js";
import { autoInjectable } from "tsyringe";
import { DiscordEventListener } from "@discordbot/types"

@autoInjectable()
export class DiscordMessageCreateEvent implements DiscordEventListener {
    constructor() {}

    execute(client: Client): void {
        // client.on("messageCreate" , async (message) => {
            
        // })
    }
}