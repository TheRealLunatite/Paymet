import { WebsocketEventHandler } from "@common/eventHandler"

type PlayerInfo = {
    eventType : string,
    userId : number,
    username : string,
    placeId : number,
}

export default new WebsocketEventHandler({
    event : "message",
    listener : (data) => {
        const a = JSON.parse(data.toString())

        console.log(a)
    }
})
