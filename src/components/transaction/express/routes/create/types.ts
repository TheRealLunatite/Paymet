import { DiscordId } from "@common/discordId"
import { Username } from "@common/username"
import { InventoryItem } from "@modules/inventory/types"

export type CreateTransactionRequestBody = {
    username : string,
    discordId : number,
    items : InventoryItem[]
}

export type CreateTransactionRequestValidatedBody = {
    username : Username,
    discordId : DiscordId,
    items : InventoryItem[]
}