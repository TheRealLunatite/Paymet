import { Collection } from "discord.js";
import { AddPriceModule } from "./addPrice";
import { DiscordSlashCommandsCollection , DiscordSlashCommandModule } from "./types";

const DiscordCommands : DiscordSlashCommandsCollection = new Collection<string , DiscordSlashCommandModule>() 
DiscordCommands.set("addprice" , new AddPriceModule())

export default DiscordCommands