import { Client } from "discord.js";
import { autoInjectable } from "tsyringe";
import { DiscordEventListener } from "../types";
import { DiscordSlashCommandsCollection } from "src/discordBot/commands/types";

@autoInjectable()
export class DiscordReadyEvent implements DiscordEventListener {
    constructor(
    ) {}

    execute(client: Client): void {
        client.on("ready" , async (client) => {
            const slashCommands : DiscordSlashCommandsCollection = client.slashCommands!

            // Set slash commands.
            const setBulkSlashCommandsData = Array.from(slashCommands.mapValues((value) => ({
                name : value.name,
                description : value.description,
                options : value.options,
                defaultPermission : value.defaultPermission && true
            })).values())

            await client.guilds.cache.get("557900033631059969")!.commands.set(setBulkSlashCommandsData)

            // Set slash permissions.
            const cacheSlashCommands = await client.guilds.cache.get("557900033631059969")?.commands.cache
            const setBulkSlashPermissionCommandsData = Array.from(cacheSlashCommands!.mapValues((value) => {
                const permission = slashCommands.get(value.name)!.permissions

                return {
                    id : value.id,  
                    permissions : permission || []
                }
            }).values())

            await client.guilds.cache.get("557900033631059969")!.commands.permissions.set({
                fullPermissions : setBulkSlashPermissionCommandsData
            }) 
        })
    }
}