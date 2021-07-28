
import { ISocket } from "@common/interfaces/ISocket"
import { TOKENS } from "src/di"
import { autoInjectable, inject } from "tsyringe"
import { WebSocket } from "ws"
import { TransactionModule } from "@modules/transaction/types"
import { InventoryModule } from "@modules/inventory/types"
import { WebsocketData } from "./types"
import { LoggerModule } from "@modules/logger/types"
import { RobloxUniverse } from "@common/robloxUniverse"
import { Id } from "@common/id"
import { Username } from "@common/username"

@autoInjectable()
export class MessageSocketListener implements ISocket {
    constructor(
        @inject(TOKENS.modules.transactionDb) private transcationDb? : TransactionModule,
        @inject(TOKENS.modules.inventoryDb) private inventoryDb? : InventoryModule,
        @inject(TOKENS.modules.logger) private logger? : LoggerModule
    ) {}

    execute(ws: WebSocket): void {
        ws.on("message" , async (data) => {
            const wsData : WebsocketData = JSON.parse(data as string)

            switch(wsData.type) {
                case "PlayerConnect":                    
                    ws.user = {
                        username : new Username(wsData.username),
                        userId : new Id(wsData.userId),
                        placeId : new Id(wsData.placeId)
                    }

                    await this.inventoryDb!.add({
                        socketId : ws.id,
                        userId : ws.user!.userId,
                        placeId : ws.user!.placeId,
                        username : ws.user!.username,
                        inventory :  wsData.inventory
                    })

                    this.logger!.info(`${wsData.username} <${wsData.userId}> has joined ${RobloxUniverse[wsData.placeId]}.`)                    
                    break
                case "ReceivedTradeRequest":
                    if(!ws.user) {
                        return ws.close(69420360 , "ws.user undefined.")
                    }

                    this.logger!.info(`${ws.user.username.value} <${ws.user.userId.value}> has received a trade request in ${RobloxUniverse[ws.user.placeId.value]}.`)
                    const transaction = await this.transcationDb!.findOne({ username : new Username(wsData.username) })

                    if((transaction) && (transaction.status === "pending")) {
                        return ws.send(JSON.stringify({
                            type : "AcceptTradeRequest",
                            username : wsData.username,
                            items : transaction.items
                        }))
                    }
                    
                    return ws.send(JSON.stringify({
                        type : "DeclineTradeRequest",
                        username : wsData.username 
                    }))
                case "AcceptedTradeRequest":
                    if(!ws.user) {
                        return ws.close(69420360 , "ws.user undefined.")
                    }

                    this.logger!.info(`${ws.user.username.value} <${ws.user.userId.value}> has accepted ${wsData.username} trade request in ${RobloxUniverse[ws.user.placeId.value]}.`)
                    break
                case "DeclinedTradeRequest":
                    if(!ws.user) {
                        return ws.close(69420360 , "ws.user undefined.")
                    }

                    this.logger!.info(`${ws.user.username.value} <${ws.user.userId.value}> has declined ${wsData.username} trade request in ${RobloxUniverse[ws.user.placeId.value]}.`)
                    
                    break
                case "AcceptedTrade":
                    if(!ws.user) {
                        return ws.close(69420360 , "ws.user undefined.")
                    }

                    this.logger!.info(`${ws.user.username.value} <${ws.user.userId.value}> has accepted a trade with ${wsData.username} in ${RobloxUniverse[ws.user.placeId.value]}.`)

                    

                    break
                default:
                    this.logger!.error("Socket server received a unsupported message event type.")
            }
        })
    }
}