
import { ISocket } from "@common/interfaces/ISocket"
import { TOKENS } from "src/di"
import { autoInjectable, inject } from "tsyringe"
import { WebSocket } from "ws"

import { TransactionModule } from "@modules/transaction/types"
import { InventoryModule } from "@modules/inventory/types"
import { PlayerConnect, ReceivedTradeRequest } from "./types"
import { LoggerModule } from "@modules/logger/types"
import { RobloxUniverse } from "@common/robloxUniverse"
import { Id } from "@common/id"
import { Username } from "@common/username"
import { Uuid } from "@common/uuid"

@autoInjectable()
export class MessageSocketListener implements ISocket {
    constructor(
        @inject(TOKENS.modules.transactionDb) private transcationDb? : TransactionModule,
        @inject(TOKENS.modules.inventoryDb) private inventoryDb? : InventoryModule,
        @inject(TOKENS.modules.logger) private logger? : LoggerModule
    ) {}

    execute(ws: WebSocket): void {
        ws.on("message" , async (data) => {
            const wsData : PlayerConnect | ReceivedTradeRequest = JSON.parse(data as string)
            
            switch(wsData.type) {
                case "PlayerConnect":
                    this.logger!.info(`${wsData.user} <${wsData.userId}> has joined ${RobloxUniverse[wsData.placeId]}.`)
                    
                    ws.user = {
                        username : new Username(wsData.user),
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
                    
                    break
                case "ReceivedTradeRequest":
                    if(ws.user) {
                        const { username , userId , placeId } = ws.user
                        this.logger!.info(`${username.value} <${userId.value}> has received a trade request in ${RobloxUniverse[placeId.value]}.`)

                        const transaction = await this.transcationDb!.findById(new Uuid("123"))

                        if(transaction) {
                            
                            ws.send(JSON.stringify({type : "AcceptTrade"}))
                        }

                        // ws.send(JSON.stringify({type : "AcceptTrade"}))
                    }    

                    break
                default:
                    this.logger!.error("Socket server received a unsupported message event type.")
            }
        })
    }
}