import { Client, ClientOptions , CommandInteraction , Collection } from "discord.js";
import { IDiscordValueObject } from "@common/interfaces/IDiscordValueObject";

export interface DiscordBotModule {
    execute(config : DiscordConfig , clientOptions? : ClientOptions) : Promise<Client>
}

export type DiscordConfig = {
    token : string,
    commandPath : string,
    eventPath : string
}

export interface SlashCommand extends IDiscordValueObject {
    execute(interaction : CommandInteraction) : Promise<void>
}

export interface DiscordEventListener {
    execute(client : Client) : void
}

export type DiscordSlashCommandsCollection = Collection<unknown , SlashCommand>
export type DiscordEventListenersCollection = Collection<unknown , DiscordEventListener>