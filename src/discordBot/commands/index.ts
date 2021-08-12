import { Collection } from "discord.js";
import { AddPriceCommand } from "./addPrice";
import { GetInstancesCommand } from "./getInstances";
import { GetPlacesCommand } from "./getPlaces";
import { DiscordSlashCommandsCollection , DiscordSlashCommandModule } from "./types";

const DiscordCommands : DiscordSlashCommandsCollection = new Collection<string , DiscordSlashCommandModule>() 

const AddPriceCommandInstance = new AddPriceCommand()
const GetInstancesCommandInstance = new GetInstancesCommand()
const GetPlacesCommandInstance = new GetPlacesCommand()

DiscordCommands.set(AddPriceCommandInstance.name , AddPriceCommandInstance)
DiscordCommands.set(GetInstancesCommandInstance.name , GetInstancesCommandInstance)
DiscordCommands.set(GetPlacesCommandInstance.name , GetPlacesCommandInstance)

export default DiscordCommands