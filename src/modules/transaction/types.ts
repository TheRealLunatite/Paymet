import { DiscordId } from "@common/discordId"
import { Username } from "@common/username/username"
import { Uuid } from "@common/uuid"

export interface ITransactionModule {
    add(data : Transaction) : Promise<boolean>,
    deleteById(id : Uuid) : Promise<boolean>,
    findById(id : Uuid) : Promise<Transaction | null>,
    deleteById(id : Uuid) : Promise<boolean>,
    updateById(id : Uuid , data : TransactionOptional) : Promise<boolean>
}

export type Transaction = {
    id : Uuid,
    status : "success" | "initalized" | "pending",
    username : Username,
    discordid : DiscordId
}

export type TransactionOptional = {
    id? : Uuid,
    status? : "success" | "initalized" | "pending",
    username? : Username,
    discordid? : DiscordId
}

export type TransactionDoc = {
    id : string,
    status : "success" | "initalized" | "pending",
    robloxuser : string,
    discordid : string,
    timestamp : string
}

/*

*/