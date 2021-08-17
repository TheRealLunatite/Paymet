import { Uuid } from "@common/uuid"
import { Id } from "@common/id"
import { Username } from "@common/username"

export interface InstanceModule {
    add(data : Instance) : Promise<Instance>,
    deleteById(id : Uuid) : Promise<DeleteInstanceResponse>,
    findOne(data : InstanceOpts) : Promise<InstanceWithTimestamp | null>,
    findAll(data : InstanceOpts) : Promise<InstanceWithTimestamp[] | null>,
    updateById(id : Uuid , opts : InstanceOpts) : Promise<boolean> ,
    getCount() : Promise<CountInstancesResponse>
}

export interface Instance {
    socketId : Uuid,
    userId : Id,
    placeId : Id,
    username : Username,
    inventory : Array<InventoryItem>
}

export interface InstanceWithTimestamp extends Instance {
    timestamp : Date
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
    username? : Username,
    inventory? : InventoryItem[]
}

export type InstanceDoc = {
    socketid : string,
    userid : string,
    placeid : string,
    username : string,
    inventory : InventoryItem[]
    timestamp : string
}

export type DeleteInstanceResponse = {
    deleted : number
}

export type CountInstancesResponse = {
    count : number
}

export type FindType = "FindAll" | "FindOne"