import { Collection } from "discord.js";
import { AddPriceModule } from "./addPrice";
import { GetInstancesModule } from "./getInstances";
import { DiscordSlashCommandsCollection , DiscordSlashCommandModule } from "./types";

const DiscordCommands : DiscordSlashCommandsCollection = new Collection<string , DiscordSlashCommandModule>() 
DiscordCommands.set("addprice" , new AddPriceModule())
DiscordCommands.set("getinstances" , new GetInstancesModule())

export default DiscordCommands