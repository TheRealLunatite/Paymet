export type InventoryItem = {
    itemName : string,
    itemRarity : string,
    itemType : string,
    itemImage : string,
    itemStock : number
}

export interface PlayerConnect {
    type : "PlayerConnect"
    userId : number,
    placeId : number,
    user : string,
    inventory : InventoryItem[]
}

export interface ReceivedTradeRequest {
    type : "ReceivedTradeRequest",
    user : string
}

