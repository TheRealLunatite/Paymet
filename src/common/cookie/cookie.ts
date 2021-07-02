import { IValidate } from "@common/interfaces/IValidate";
import { IValueObject } from "@common/interfaces/IValueObject";

export class Cookie implements IValueObject<string> , IValidate {
    value: string;

    constructor(cookie : string) {
        this.value = cookie

        if(!this.isValid()) {
            throw new CookieNotValidError("Not a valid cookie.")
        }
    }

    isValid(): boolean {
        return this.value != null && /[A-Za-z0-9]{584}|[A-Za-z0-9]{616}/g.test(this.value)
    }
}

export class CookieNotValidError extends Error {
    constructor(message : string) {
        super(message);

        this.name = this.constructor.name;
        this.stack = new Error().stack;
    }
}