import { IDiscordValueObject } from "@common/interfaces/IDiscordValueObject";
import { Collection, CommandInteraction } from "discord.js";

export interface DiscordSlashCommandModule extends IDiscordValueObject {
    execute(interaction : CommandInteraction) : Promise<void>
}

export type DiscordSlashCommandsCollection = Collection<string , DiscordSlashCommandModule>