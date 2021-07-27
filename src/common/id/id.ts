import { IEquatable } from "@common/interfaces/IEquatable";
import { IValidate } from "@common/interfaces/IValidate";
import { IValueObject } from "@common/interfaces/IValueObject";

export class Id implements IValidate , IValueObject<number> , IEquatable<Id> {
    value : number

    constructor(id : number) {
        this.value = id

        if(!this.isValid()) {
            throw new IdIsNotValid("Id is not an integer.")
        }
        
    }

    equal(object: Id): boolean {
        return this.value === object.value
    }

    isValid(): boolean {
        return Number.isInteger(this.value) && !isNaN(this.value)
    }
}

export class IdIsNotValid extends Error {
    constructor(message : string) {
        super(message);

        this.name = this.constructor.name;
        this.stack = new Error().stack;
    }
}