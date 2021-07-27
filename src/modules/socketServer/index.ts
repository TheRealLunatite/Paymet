import { inject , injectable } from "tsyringe";
import { TOKENS } from "../../di";
import { application } from "express"
import ws  , { ServerOptions } from "ws"
import http , { Server } from "http"
import { WebSocketServer } from "./types";
import { v4 } from "uuid"
import { ISocket } from "@common/interfaces/ISocket";
import { Uuid } from "@common/uuid";

@injectable()
export class WebSocketServerModule implements WebSocketServer {
    private httpServer : Server
    private wsServer : ws.Server
    
    constructor(
        @inject(TOKENS.values.expressApp) private app : typeof application, 
        @inject(TOKENS.values.httpLib) private httpLib : typeof http,
        @inject(TOKENS.values.uuid) private uuid : typeof v4,
        @inject(TOKENS.values.websocketLib) private websocketLib : typeof ws,
        @inject(TOKENS.listeners.websocket) private socketListeners : ISocket[]
    ) {
        this.httpServer = this.httpLib.createServer(this.app)
    }

    public async listen(options? : ServerOptions) : Promise<void> {
        this.wsServer = new this.websocketLib.Server({
            server : this.httpServer,
            ...options
        })  
        
        this.wsServer.on("connection" , (ws , req) => {
            // Set an id to identify each individual client connected to our websocket.
            ws.id = new Uuid(this.uuid())

            this.socketListeners.forEach((socketListener) => {
                socketListener.execute(ws)
            })
        })
    }
}
