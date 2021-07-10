import ws from "ws"
import http from "http"

export type MessageHandler = {
    event : "message",
    listener : (data : ws.Data) => void
}

export type ErrorHandler = {
    event : "error",
    listener : (err : Error) => void
}

export type OpenHandler = {
    event : "open",
    listener : () => void
}

export type CloseHandler = {
    event : "close",
    listener : (code : number , reason : string) => void
}

export type PingPongHandler = {
    event : "ping" | "pong",
    listener : (data : Buffer) => void
}

export type UnexpectedResponseHandler = {
    event : "unexpected-response",
    listener : (request : http.ClientRequest , response : http.IncomingMessage) => void
}

export type UpgradeHandler = {
    event : "upgrade",
    listener : (request : http.IncomingMessage) => void
}

export type EventHandler = MessageHandler | ErrorHandler | OpenHandler | CloseHandler | PingPongHandler | UnexpectedResponseHandler | UpgradeHandler