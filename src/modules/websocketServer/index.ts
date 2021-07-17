import { inject , injectable } from "tsyringe";
import { TOKENS } from "../../di";
import { application } from "express"
import ws  , { ServerOptions } from "ws"
import http , { Server } from "http"
import { WebSocketServer } from "./types";
import { WebsocketEventHandler } from "@common/eventHandler"

@injectable()
export class WebSocketServerModule implements WebSocketServer {
    httpServer : Server
    wsServer : ws.Server
    
    constructor(@inject(TOKENS.values.expressApp) private app : typeof application, @inject(TOKENS.values.httpLib) private httpLib : typeof http  , @inject(TOKENS.values.websocketLib) private websocketLib : typeof ws , @inject(TOKENS.websocket.listeners) private eventHandlers : WebsocketEventHandler[]) {
        this.httpServer = this.httpLib.createServer(this.app)
    }
    
    public async start(options? : ServerOptions) : Promise<void> {
        this.wsServer = new this.websocketLib.Server({
            server : this.httpServer,
            ...options
        })  

        this.wsServer.on("connection" , (ws) => {
            this.eventHandlers.forEach((eventHandler) => {
                const { event , listener } = eventHandler.value
                ws.on(event , listener)
            })
        })
    }
}
