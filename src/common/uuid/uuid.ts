import { IValidate } from "@common/interfaces/IValidate";
import { IValueObject } from "@common/interfaces/IValueObject";
import { validate as uuidValidate} from "uuid"

export class Uuid implements IValidate , IValueObject<string> {
    value: string
    
    constructor(uuid : string) {
        this.value = uuid

        if(!this.isValid()) {
            throw new UuidIsNotValid("UUID is not valid.")
        }
    }

    isValid(): boolean {
        return uuidValidate(this.value)
    }
}

export class UuidIsNotValid extends Error {
    constructor(message : string) {
        super(message);

        this.name = this.constructor.name;
        this.stack = new Error().stack;
    }
}