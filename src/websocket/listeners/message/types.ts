import { InventoryItem } from "@modules/inventory/types";

export interface PlayerConnect {
    type : "PlayerConnect"
    userId : number,
    placeId : number,
    username : string,
    inventory : InventoryItem[]
}

export interface ReceivedTradeRequest {
    type : "ReceivedTradeRequest",
    username : string
}

