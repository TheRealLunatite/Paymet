import { InventoryItem } from "@modules/inventory/types";

export type WebsocketData = PlayerConnect | Trade

export type PlayerConnect = {
    type : "PlayerConnect"
    userId : number,
    placeId : number,
    username : string,
    inventory : InventoryItem[]
}

export type Trade = {
    type : "DeclineTradeRequest" | "AcceptedTradeRequest" | "ReceivedTradeRequest" | "AcceptedTrade" | "DeclinedTradeRequest",
    username : string
}