import { DiscordId } from "@common/discordId";
import { Username } from "@common/username";
import { Uuid } from "@common/uuid";

export type UpdateTransactionRequestBody = {
    id : string,
    status? : "success" | "initalized" | "pending",
    username? : string,
    discordId? : number
}

export type UpdateTransactionValidatedRequestBody = {
    id : Uuid,
    status? : "success" | "initalized" | "pending",
    username? : Username,
    discordId : DiscordId
}