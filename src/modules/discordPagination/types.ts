import { MessageEmbed , CommandInteraction } from "discord.js";

export interface Pagination {
    execute(interaction : CommandInteraction , embeds : MessageEmbed[]) : void
}