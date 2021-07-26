import { Id } from "@common/id";
import { Username } from "@common/username";
import { Uuid } from "@common/uuid";

export interface InventoryModule {
    add(data : InventoryData) : void,
    deleteById(id : Uuid) : Promise<boolean>
}

export type InventoryData = {
    socketId : Uuid,
    userId : Id,
    placeId : Id,
    username : Username,
    inventory : Array<InventoryItem>
}

export type InventoryItem = {
    itemName : string,
    itemRarity : string,
    itemType : string,
    itemImage : string,
    itemStock : number
}

export type InventoryDoc = {

}