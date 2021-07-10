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
        const JSONData = JSON.parse(data as string)

        console.log(JSONData.userId)
    }
})
