import { Uuid } from "@common/uuid"
import { Id } from "@common/id"
import { Username } from "@common/username"

export interface InstanceModule {
    add(data : Instance) : Promise<Instance>,
    deleteById(id : Uuid) : Promise<DeleteInstanceResponse>,
    findOne(data : InstanceOpts) : Promise<Instance | null>,
    findAll(data : InstanceOpts) : Promise<Instance[] | null>
}

export type Instance = {
    socketId : Uuid,
    userId : Id,
    placeId : Id,
    username : Username,
    inventory : Array<InventoryItem>
}

export type InventoryItem = {
    itemName : string,
    itemRawName: string,
    itemRarity : string,
    itemType : string,
    itemImage : string,
    itemStock : number
}

export type InstanceOpts = {
    socketId? : Uuid,
    userId? : Id,
    placeId? : Id,
    username? : Username
}

export type InstanceDoc = {
    socketid : string,
    userid : string,
    placeid : string,
    username : string,
    inventory : InventoryItem[]
}

export type DeleteInstanceResponse = {
    deleted : number
}

export type FindType = "FindAll" | "FindOne"