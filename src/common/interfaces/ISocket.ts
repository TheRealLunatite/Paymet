import { WebSocket } from "ws";

export interface ISocket {
    execute(ws : WebSocket) : void
}