import { RobloxUniverse } from "@common/robloxUniverse";
import { InstanceDBModule } from "@modules/instances";
import { CommandInteraction } from "discord.js";
import { TOKENS } from "src/di";
import { autoInjectable, inject } from "tsyringe";
import { SlashCommand } from "@discordbot/types"

@autoInjectable()
export class GetPlacesCommand implements SlashCommand {
    name = "getplaces"
    description = "Get all of the active places where you can purchase items from."
    options = []
    defaultPermission = true
    permissions = []

    constructor(
        @inject(TOKENS.modules.instanceDb) private instanceDb? : InstanceDBModule
    ) {}
    

    execute(interaction : CommandInteraction): Promise<void> {
        return new Promise(async (resolve , reject) => {
            const instances = await this.instanceDb!.findAll({})

            if(!instances) {
                return await interaction.reply("There is currently no active places that sell items.")
            }

            // Filter the instances to get unique place ids.
            const filteredInstances = instances.filter((instance , index , self) => {
                const placeId = instance.placeId.value
                return index === self.findIndex((instance) => instance.placeId.value === placeId)
            })

            let string = ``
            filteredInstances.forEach((instance) => string += `${RobloxUniverse[instance.placeId.value] ?? "Unknown"} | ${instance.placeId.value} \n`)

            return interaction.reply({
                content : string,
                ephemeral : true
            })
        })
    }
}