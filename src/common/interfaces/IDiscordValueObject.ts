import { ApplicationCommandOptionData , ApplicationCommandPermissionData } from "discord.js";


export interface IDiscordValueObject {
    name : string,
    description : string,
    options : ApplicationCommandOptionData[],
    defaultPermission? : boolean
    permissions? : ApplicationCommandPermissionData[]
}
