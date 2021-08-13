import { Collection } from "discord.js";

import { AddPriceCommand } from "./addPrice";
import { GetInstancesCommand } from "./getInstances";
import { GetPlacesCommand } from "./getPlaces";
import { GetPlaceStockCommand } from "./getPlaceStock";

import { DiscordSlashCommandsCollection , DiscordSlashCommandModule } from "./types";

const DiscordCommands : DiscordSlashCommandsCollection = new Collection<string , DiscordSlashCommandModule>() 

// Get a better command handler holy shit what is this shit

const AddPriceCommandInstance = new AddPriceCommand()
const GetInstancesCommandInstance = new GetInstancesCommand()
const GetPlacesCommandInstance = new GetPlacesCommand()
const GetPlaceStockCommandInstance = new GetPlaceStockCommand()

DiscordCommands.set(AddPriceCommandInstance.name , AddPriceCommandInstance)
DiscordCommands.set(GetInstancesCommandInstance.name , GetInstancesCommandInstance)
DiscordCommands.set(GetPlacesCommandInstance.name , GetPlacesCommandInstance)
DiscordCommands.set(GetPlaceStockCommandInstance.name , GetPlaceStockCommandInstance)

export default DiscordCommands