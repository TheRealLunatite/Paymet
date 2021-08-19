import { InventoryItem } from "@modules/instanceDb/types";

export type MessageSocketData = PlayerConnect | TradeInfo

export type PlayerConnect = {
    type : "PlayerConnect"
    userId : number,
    placeId : number,
    username : string,
    inventory : InventoryItem[]
}

export type TradeType = "AcceptedTradeRequest" | "ReceivedTradeRequest" | "AcceptedTrade" | "DeclinedTradeRequest"
export type MessageType = "AcceptedTradeRequest" | "ReceivedTradeRequest" | "AcceptedTrade" | "DeclinedTradeRequest" | "PlayerConnect"

export type TradeInfo = {
    type : TradeType,
    username : string
}