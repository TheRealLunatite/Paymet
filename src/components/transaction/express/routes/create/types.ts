import { DiscordId } from "@common/discordId"
import { Username } from "@common/username"
import { ItemPurchased } from "@modules/transaction/types"

export type CreateTransactionRequestBody = {
    username : string,
    discordId : number,
    items : ItemPurchased[]
}

export type CreateTransactionRequestValidatedBody = {
    username : Username,
    discordId : DiscordId,
    items : ItemPurchased[]
}