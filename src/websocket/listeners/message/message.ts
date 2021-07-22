
import { ISocket } from "@common/interfaces/ISocket"
import { TOKENS } from "src/di"
import { autoInjectable, inject } from "tsyringe"
import { WebSocket } from "ws"
import { ITransactionModule } from "@modules/transaction/types"
import { IInventoryModule } from "@modules/inventory/types"
import { PlayerConnect, ReceivedTradeRequest } from "./types"
import { Uuid } from "@common/uuid"
import { Id } from "@common/id"
import { Username } from "@common/username"

@autoInjectable()
export class MessageSocketListener implements ISocket {
    constructor(
        @inject(TOKENS.modules.transactionDb) private transcationDb? : ITransactionModule,
        @inject(TOKENS.modules.inventoryDb) private inventoryDb? : IInventoryModule
    ) {}

    execute(ws: WebSocket): void {
        ws.on("message" , async (data) => {
            try {
                console.log(ws.id)
                const wsData : PlayerConnect | ReceivedTradeRequest = JSON.parse(data as string)
                
                switch(wsData.type) {
                    case "PlayerConnect":
                        console.log(`${wsData.user} has connected to the websocket.`)
                        
                        await this.inventoryDb!.add({
                            socketId : new Uuid(ws.id),
                            userId : new Id(wsData.userId),
                            placeId : new Id(wsData.placeId),
                            robloxUser : new Username(wsData.user),
                            inventory :  wsData.inventory
                        })
                        
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
                console.log(e)
                return ws.send(JSON.stringify({
                    type : "error",
                    message : e.message
                }))
            }
        })
    }
}