import { WebsocketEventHandler } from "@common/eventHandler"

export default new WebsocketEventHandler({
    event : "close",
    listener : (code , reason) => {
        console.error(`Socket closed : ${code}.`)
    }
})