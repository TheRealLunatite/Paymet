import { DiscordId } from "@common/discordId"
import { Id } from "@common/id"
import { Username } from "@common/username"
import { ItemPurchased } from "@modules/transaction/types"

export type CreateTransactionRequestBody = {
    username : string,
    discordId : number,
    itemPlaceId : number,
    items : ItemPurchased[]
}

export type CreateTransactionRequestValidatedBody = {
    username : Username,
    discordId : DiscordId,
    itemPlaceId : Id,
    items : ItemPurchased[]
}