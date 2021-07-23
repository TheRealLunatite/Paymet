import { IValueObject } from "@common/interfaces/IValueObject";
import { RequestHandler } from "express";

export class Middleware implements IValueObject<RequestHandler> {
    _value : RequestHandler

    constructor(requestHandler : RequestHandler) {
        this._value = requestHandler
    }

    get value() {
        return this._value
    }
}