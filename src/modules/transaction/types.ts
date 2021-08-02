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
    itemName : string,
    itemType : string,
    amount : number
}

export type Transaction = {
    id : Uuid,
    status : "success" | "initalized" | "pending",
    username : Username,
    discordId : DiscordId,
    devProductId : Id,
    items : ItemPurchased[],
    timestamp? : Date
}

export type TransactionOptional = {
    id? : Uuid,
    status? : "success" | "initalized" | "pending",
    username? : Username,
    devProductId? : number,
    discordId? : DiscordId
}

export type TransactionDoc = {
    id : string,
    status : "success" | "initalized" | "pending",
    username : string,
    discordid : number,
    timestamp : string,
    devProductId : number,
    items : string
}

export type FindTransactionOptions = {
    id? : Uuid,
    discordId? : DiscordId,
    username? : Username,
    devProductId? : Id
}
