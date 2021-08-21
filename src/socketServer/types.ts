import { ServerOptions , WebSocket } from "ws";

export interface SocketServer {
    listen(options? : ServerOptions , cb? : (ws : WebSocket) => void) : void
}
