import { WebsocketEventHandler } from "@common/eventHandler"
import { WebSocket } from "ws"

export type InventoryItem = {
    name : string,
    rarity : string,
    type : string,
    image : string,
    stock : string
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

export default new WebsocketEventHandler({
    event : "message",
    listener : function(data) {
        const ws : WebSocket = this        
        try {
            const wsData : PlayerConnect | ReceivedTradeRequest = JSON.parse(data.toString())
            
            switch(wsData.type) {
                case "PlayerConnect":
                    console.log(`${wsData.user} has connected to the websocket.`)
                    break
                case "ReceivedTradeRequest":
                    console.log(`${wsData.user} has sent you a trade request on MM2.`)
                    ws.send(JSON.stringify({type : "AcceptTrade"}))
                    break
                default:
                    ws.send(JSON.stringify({
                        type : "error",
                        message : "Unsupported event type."
                    }))
            }
        } catch (e) {
            return ws.send({
                type : "error",
                message : e.message
            })
        }
    }
})
