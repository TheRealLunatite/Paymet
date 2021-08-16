import { DiscordId } from "@common/discordId"
import { Id } from "@common/id"
import { Username } from "@common/username/username"
import { Uuid } from "@common/uuid"

export interface TransactionModule {
    add(data : Transaction) : Promise<Transaction>,
    deleteById(id : Uuid) : Promise<boolean>,
    findOne(opts : FindTransactionOptions) : Promise<Transaction | null>,
    deleteById(id : Uuid) : Promise<boolean>,
    updateById(id : Uuid , data : TransactionOptional) : Promise<boolean>
}

export type ItemPurchased = {
    itemRawName : string,
    itemType : string,
    amount : number
}

export type Transaction = {
    id : Uuid,
    status : "success" | "initalized" | "pending",
    username : Username,
    discordId : DiscordId,
    assetId : Id,
    items : ItemPurchased[],
    timestamp? : Date
}

export type TransactionOptional = {
    id? : Uuid,
    status? : "success" | "initalized" | "pending",
    username? : Username,
    assetId? : number,
    discordId? : DiscordId,
    items : ItemPurchased[]
}

export type TransactionDoc = {
    id : string,
    status : "success" | "initalized" | "pending",
    username : string,
    discordid : string,
    timestamp : string,
    assetid : string,
    items : ItemPurchased[]
}

export type FindTransactionOptions = {
    id? : Uuid,
    discordId? : DiscordId,
    username? : Username,
    assetId? : Id
}
