import { InstanceModule } from "@modules/instances/types"
import { CommandInteraction, MessageEmbed } from "discord.js";
import { TOKENS } from "src/di";
import { autoInjectable, inject } from "tsyringe";
import { SlashCommand } from "@discordbot/types"
import { DiscordPagination } from "@modules/discordPagination";
import { RobloxUniverse } from "@common/robloxUniverse";

@autoInjectable()
export class GetInstancesCommand implements SlashCommand {
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
        @inject(TOKENS.modules.discordPagination) private pagination? : typeof DiscordPagination,
        @inject(TOKENS.values.discordMessageEmbed) private embed? : typeof MessageEmbed,
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

            if(!instances) {
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
                        name : "Place Name",
                        value : RobloxUniverse[instance.placeId.value] ?? "Unknown",
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

            return new this.pagination!().execute(interaction , embeds)
        })
    }
}