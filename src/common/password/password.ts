import { IValidate } from "@common/interfaces/IValidate";
import { IValueObject } from "@common/interfaces/IValueObject";

export class Password implements IValidate , IValueObject<string> {
    value : string
    
    constructor(password : string) {
        this.value = password

        if(!this.isValid()) {
            throw new PasswordNotValid("Password does not pass the RegEx test.")
        }
    }

    isValid(): boolean {
        // https://www.computerworld.com/article/2833081/how-to-validate-password-strength-using-a-regular-expression.html   
        /*
            The password length must be greater than or equal to 8
            The password must contain one or more uppercase characters
            The password must contain one or more lowercase characters
            The password must contain one or more numeric values
            The password must contain one or more special characters
        */

        const regex = new RegExp(/(?=^.{8,}$)(?=.*\d)(?=.*[!@#$%^&*]+)(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/gm)
        return regex.test(this.value)
    }
}

export class PasswordNotValid extends Error {
    constructor(message : string) {
        super(message);

        this.name = this.constructor.name;
        this.stack = new Error().stack;
    }
}