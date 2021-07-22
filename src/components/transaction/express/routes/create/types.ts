import { DiscordId } from "@common/discordId"
import { Username } from "@common/username"

export type CreateTransactionRequestBody = {
    robloxUser : string,
    discordId : number
}

export type CreateTransactionRequestValidatedBody = {
    robloxUser : Username,
    discordId : DiscordId
}