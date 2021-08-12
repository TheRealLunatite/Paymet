import { RobloxUniverse } from "@common/robloxUniverse";
import { InstanceDBModule } from "@modules/instances";
import { CommandInteraction } from "discord.js";
import { TOKENS } from "src/di";
import { autoInjectable, inject } from "tsyringe";
import { DiscordSlashCommandModule } from "../types";

@autoInjectable()
export class GetPlacesCommand implements DiscordSlashCommandModule {
    name = "getplaces"
    description = "Active places where you can purchase items from."
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

            let string = ``
            instances.forEach((instance) => string += `${RobloxUniverse[instance.placeId.value]} | ${instance.placeId.value} \n`)

            return interaction.reply({
                content : string,
                ephemeral : true
            })
        })
    }
}