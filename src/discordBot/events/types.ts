import { Client } from "discord.js";

export interface DiscordEventListener {
    execute(client : Client) : void
}