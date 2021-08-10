import { Client, ClientOptions } from "discord.js";

export interface DiscordBotModule {
    execute(config : DiscordConfig , clientOptions? : ClientOptions) : Promise<Client>
}

export type DiscordConfig = {
    token : string
}