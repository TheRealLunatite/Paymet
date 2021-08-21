import { DiscordSlashCommandsCollection } from "src/discordBot/types";
import { Message } from "discord.js";

declare module "discord.js" {
    export interface Client {
        slashCommands? : DiscordSlashCommandsCollection
        isUserInCheckout? : boolean
    }
}