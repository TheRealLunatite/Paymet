import { WebsocketEventHandler } from "@common/eventHandler"

type PlayerInfo = {
    eventType : string,
    userId : number,
    username : string,
    placeId : number,
}

export default new WebsocketEventHandler({
    event : "message",
    listener : function(data) {
        try {
            console.log(data)
        } catch (e) {
            console.log(e)
        }
    }
})
