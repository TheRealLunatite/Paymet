import { IValueObject } from "@common/interfaces/IValueObject"
import { EventHandler } from "./types"

export class WebsocketEventHandler implements IValueObject<EventHandler> {
    private _value: EventHandler

    constructor(handler : EventHandler) {
        this._value = handler
    }

    get value() : EventHandler {
        return this._value
    }   
}
