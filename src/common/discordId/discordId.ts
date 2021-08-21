import { IEquatable } from "@common/interfaces/IEquatable";
import { IValidate } from "@common/interfaces/IValidate";
import { IValueObject } from "@common/interfaces/IValueObject";

export class DiscordId implements IValidate , IEquatable<DiscordId> , IValueObject<string> {
    value : string;

    constructor(discordId : string) {
        this.value = discordId    
        
        if(!this.isValid()) {
            throw new DiscordIdIsNotValid("Discord ID is not valid.")
        }
    }

    isValid(): boolean {
        if(!this.value) {
            return false
        }

        if(isNaN(+this.value) || !Number.isInteger(+this.value)) {
            return false
        }   

        // 4194304 is the lowest value a Discord ID can be.
        if(this.value as any as number < 4194304) {
            return false
        }
        
        try {
            // convert to discord unix
            new Date((this.value as any as number / 4194304) + 1420070400000)
        } catch {
            return false
        }

        return true
    }

    equal(object: DiscordId): boolean {
        return this.value === object.value
    }
}

export class DiscordIdIsNotValid extends Error {
    constructor(message : string) {
        super(message);

        this.name = this.constructor.name;
        this.stack = new Error().stack;
    }
}