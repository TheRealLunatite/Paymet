import { inject , injectable } from "tsyringe";
import { TOKENS } from "../di";
import ws  , { ServerOptions } from "ws"
import { SocketServer } from "./types";
import { v4 } from "uuid"
import { ISocket } from "@common/interfaces/ISocket";
import { Uuid } from "@common/uuid";

@injectable()
export class WebSocketServer implements SocketServer {
    private wsServer : ws.Server
    
    constructor(
        @inject(TOKENS.values.uuid) private uuid : typeof v4,
        @inject(TOKENS.values.websocketLib) private websocketLib : typeof ws,
        @inject(TOKENS.websocket.listeners) private socketListeners : ISocket[]
    ) {}

    public async listen(options? : ServerOptions) : Promise<void> {
        this.wsServer = new this.websocketLib.Server({
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
