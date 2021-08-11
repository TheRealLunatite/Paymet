import { InstanceModule } from "@modules/instances/types"
import { CommandInteraction, MessageEmbed } from "discord.js";
import { TOKENS } from "src/di";
import { autoInjectable, inject } from "tsyringe";
import { v4 as uuid } from "uuid"
import { DiscordSlashCommandModule } from "../types";
import { Pagination } from "@modules/discordPagination/types";

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
        @inject(TOKENS.modules.discordPagination) private pagination? : Pagination,
        @inject(TOKENS.values.discordMessageEmbed) private embed? : typeof MessageEmbed,
        @inject(TOKENS.values.uuid) private v4? : typeof uuid
    ) {}
    
    // Needs to calculate with day also.
    private calculateElapsedTime(date : Date) : string {
        const currentUnix = Math.floor(Date.now() / 1000)
        const unix = Math.floor(date.getTime() / 1000)
        return new Date((currentUnix - unix) * 1000).toISOString().substr(11, 8)
    }

    execute(interaction : CommandInteraction): Promise<void> {
        return new Promise(async (resolve , reject) => {
            const instances = await this.instanceDb!.findAll({})

            if(instances.length <= 0) {
                return await interaction.reply("There is currently no connected socket instances.")
            }



            const embeds = instances.map((instance , index) => (
                new this.embed!()
                .setTitle(`Page : ${index + 1} / ${instances.length}`)
                .setFooter(instance.socketId.value)
                .setFields([
                    {
                        name : "Username",
                        value : instance.username.value,
                        inline : true
                    },
                    {
                        name : "PlaceId",
                        value : instance.placeId.value.toString(),
                        inline : true
                    },
                    {
                        name : "Elapsed Time",
                        value : this.calculateElapsedTime(instance.timestamp),
                        inline : true
                    },
                    {
                        name : "Inventory",
                        value : instance.inventory.length.toString(),
                        inline : true
                    },
                ])
                .setTimestamp()
            ))

            return this.pagination!.execute(interaction , embeds)
        })
    }
}