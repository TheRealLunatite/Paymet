import { MessageEmbed , CommandInteraction } from "discord.js";

export interface Pagination {
    execute(opts : DiscordPaginationOpts) : void
}

export type DiscordPaginationOpts = {
    interaction : CommandInteraction,
    embeds : MessageEmbed[],
    timeInSeconds? : number
    idleInSeconds? : number
}