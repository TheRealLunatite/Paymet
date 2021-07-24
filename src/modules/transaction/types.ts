import { DiscordId } from "@common/discordId"
import { Username } from "@common/username/username"
import { Uuid } from "@common/uuid"
import { InventoryItem } from "@modules/inventory/types"

export interface ITransactionModule {
    add(data : Transaction) : Promise<Transaction>,
    deleteById(id : Uuid) : Promise<boolean>,
    findById(id : Uuid) : Promise<Transaction | null>,
    deleteById(id : Uuid) : Promise<boolean>,
    updateById(id : Uuid , data : TransactionOptional) : Promise<boolean>
}

export type Transaction = {
    id : Uuid,
    status : "success" | "initalized" | "pending",
    username : Username,
    discordId : DiscordId,
    items : InventoryItem[]
}

export type TransactionOptional = {
    id? : Uuid,
    status? : "success" | "initalized" | "pending",
    username? : Username,
    discordId? : DiscordId
}

export type TransactionDoc = {
    id : string,
    status : "success" | "initalized" | "pending",
    robloxuser : string,
    discordid : string,
    timestamp : string,
    items : InventoryItem[]
}

/*

*/