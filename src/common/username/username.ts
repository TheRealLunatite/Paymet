import { IValidate } from "@common/interfaces/IValidate";
import { IValueObject } from "@common/interfaces/IValueObject";

export class Username implements IValueObject<string> , IValidate {
    value : string
    constructor(username : string) {
        this.value = username

        if(!this.isValid()) {
            throw new UsernameNotValid(`Username must be between 3 and 20 characters long.`)
        }
    }

    isValid(): boolean {
        if(this.value) {
            return this.value.length >= 3 && this.value.length <= 20
        }

        return false
    }
}

export class UsernameNotValid extends Error {
    constructor(message : string) {
        super(message);

        this.name = this.constructor.name;
        this.stack = new Error().stack;
    }
}