import { ServerOptions , WebSocket } from "ws";

export interface WebSocketServer {
    listen(options? : ServerOptions , cb? : (ws : WebSocket) => void) : void
}
