import { IValidate } from "@common/interfaces/IValidate";
import { IValueObject } from "@common/interfaces/IValueObject";

export class BCryptHash implements IValueObject<string> , IValidate {
    value : string

    constructor(hash : string) {
        this.value = hash

        if(!this.isValid()) {
            throw new BCryptHashNotValid("Not a valid bcrypt hash.")
        }

    }

    isValid(): boolean {
        const regex = new RegExp(/^\$2[ayb]\$.{56}$/gm)
        return regex.test(this.value)
    }
}

export class BCryptHashNotValid extends Error {
    constructor(message : string) {
        super(message);

        this.name = this.constructor.name;
        this.stack = new Error().stack;
    }
}