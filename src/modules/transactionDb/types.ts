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
    itemRarity : string,
    itemQuantity : number,
    itemPlaceId : Id,
    itemReceived : boolean
}

export type ItemPurchasedDoc = {
    itemRawName : string,
    itemType : string,
    itemRarity : string,
    itemQuantity : number,
    itemPlaceId : number,
    itemReceived : boolean
}

export type TransactionStatus = "initalized" | "success"

export type Transaction = {
    id : Uuid,
    status : TransactionStatus,
    username : Username,
    discordId : DiscordId,
    items : ItemPurchased[],
    timestamp? : Date
}

export type TransactionOptional = {
    id? : Uuid,
    status? : TransactionStatus,
    username? : Username,
    discordId? : DiscordId,
    items?: ItemPurchased[]
}

export type TransactionDoc = {
    id : string,
    status : TransactionStatus,
    username : string,
    discordid : string,
    timestamp : string,
    items : ItemPurchasedDoc[]
}

export type FindTransactionOptions = {
    id? : Uuid,
    discordId? : DiscordId,
    username? : Username,
}
