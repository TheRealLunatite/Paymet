
import { ISocket } from "@common/interfaces/ISocket"
import { TOKENS } from "src/di"
import { autoInjectable, inject } from "tsyringe"
import { WebSocket } from "ws"
import { MessageSocketData, MessageType } from "../../modules/types"
import { ISocketModule } from "@common/interfaces/ISocketModule"
import { LoggerModule } from "@modules/logger/types"

@autoInjectable()
export class MessageSocketListener implements ISocket {
    constructor(
        @inject(TOKENS.websocket.modules.message) private modules? : Map<MessageType , ISocketModule>,
        @inject(TOKENS.modules.logger) private logger? : LoggerModule
    ) {}

    execute(ws: WebSocket): void {
        ws.on("message" , async (data) => {
            let wsData : MessageSocketData
            
            try {
                // We only accept stringify JSON strings.
                wsData = JSON.parse(data as string)
            } catch {
                this.logger!.error("Unable to parse incoming Websocket message.")
                return
            }

            try {   
                await this.modules!.get(wsData.type)!.execute(ws , wsData)
            } catch (e) {
                console.log(e)
                this.logger!.error("Your websocket server has received an unsupported message type or error.")
            }
        })
    }
}