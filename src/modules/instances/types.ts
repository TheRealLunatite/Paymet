import { Uuid } from "@common/uuid"
import { Id } from "@common/id"
import { Username } from "@common/username"

export interface InstanceModule {
    add(data : Instance) : Promise<Instance>    
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
    inventory : string
}
