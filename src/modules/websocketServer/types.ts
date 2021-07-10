import { ServerOptions } from "ws";

export interface WebSocketServer {
    start(options? : ServerOptions) : Promise<void>
}
