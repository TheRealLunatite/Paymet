import { InstanceModule } from "@modules/instances/types"
import { CommandInteraction } from "discord.js";
import { TOKENS } from "src/di";
import { autoInjectable, inject } from "tsyringe";
import { v4 as uuid } from "uuid"
import { DiscordSlashCommandModule } from "../types";

@autoInjectable()
export class GetInstancesModule implements DiscordSlashCommandModule {
    name = "getinstances"
    description = "Get info on all socket instances that are currently connected."
    options = []
    defaultPermission = false
    permissions = [
        {
            id : '573639162733789197',
            type : 2,
            permission : true
        }
    ]

    constructor(
        @inject(TOKENS.modules.instanceDb) private instanceDb? : InstanceModule,
        @inject(TOKENS.values.uuid) private v4? : typeof uuid
    ) {}
    

    execute(interaction : CommandInteraction): Promise<void> {
        return new Promise(async (resolve , reject) => {
            const instances = await this.instanceDb!.findAll({})
            
            // const currentUnix = Math.floor(Date.now() / 1000)
            // const instanceUnix = Math.floor(instances[0].timestamp.getTime() / 1000)

            // console.log("time elpased : " + new Date((currentUnix - instanceUnix) * 1000).toISOString().substr(11, 8))

            return interaction.reply("hello world")
        })
    }
}