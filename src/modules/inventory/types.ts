import { Id } from "@common/id";
import { Username } from "@common/username";
import { Uuid } from "@common/uuid";

export interface InventoryModule {
    add(data : Inventory) : void,
    deleteById(id : Uuid) : Promise<boolean>,
    findOne(opts : FindInventoryOpts) : Promise<Inventory | null>
}

export type Inventory = {
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

export type FindInventoryOpts = {
    socketId? : Uuid,
    userId? : Id,
    placeId? : Id,
    username? : Username
}

export type InventoryDoc = {
    socketid : string,
    userid : string,
    placeid : string,
    username : string,
    inventory : string
}