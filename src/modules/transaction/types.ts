import { DiscordId } from "@common/discordId"
import { Username } from "@common/username/username"
import { Uuid } from "@common/uuid"
import { InventoryItem } from "@modules/inventory/types"

export interface TransactionModule {
    add(data : Transaction) : Promise<Transaction>,
    deleteById(id : Uuid) : Promise<boolean>,
    findOne(opts : FindTransactionOptions) : Promise<Transaction | null>,
    deleteById(id : Uuid) : Promise<boolean>,
    updateById(id : Uuid , data : TransactionOptional) : Promise<boolean>
}

export type Transaction = {
    id : Uuid,
    status : "success" | "initalized" | "pending",
    username : Username,
    discordId : DiscordId,
    items : InventoryItem[],
    timestamp? : Date
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
    username : string,
    discordid : string,
    timestamp : string,
    items : string
}

export type FindTransactionOptions = {
    id? : Uuid,
    discordId? : DiscordId,
    username? : Username,
}

/*

*/