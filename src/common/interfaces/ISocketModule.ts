import { WebSocket } from "ws";

export interface ISocketModule {
    execute(ws : WebSocket , data : unknown) : void
}