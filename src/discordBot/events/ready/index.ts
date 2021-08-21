import { Client } from "discord.js";
import { autoInjectable } from "tsyringe";
import { DiscordEventListener } from "src/discordBot/types"
import { DiscordSlashCommandsCollection } from "@discordbot/types";

@autoInjectable()
export class DiscordReadyEvent implements DiscordEventListener {
    private serverId = "557900033631059969"

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

            await client.guilds.cache.get(this.serverId)!.commands.set(setBulkSlashCommandsData)

            // Set slash permissions.
            const cacheSlashCommands = await client.guilds.cache.get(this.serverId)?.commands.cache
            const setBulkSlashPermissionCommandsData = Array.from(cacheSlashCommands!.mapValues((value) => {
                const permissions = slashCommands.get(value.name)!.permissions ?? []
                return {
                    id : value.id,  
                    permissions
                }
            }).values())

            await client.guilds.cache.get(this.serverId)!.commands.permissions.set({
                fullPermissions : setBulkSlashPermissionCommandsData
            }) 
        })
    }
}