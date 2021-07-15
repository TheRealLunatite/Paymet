import { Username } from "@common/username";
import { Password } from "@common/password";
import { RequestHandler } from "express";
import { autoInjectable } from "tsyringe";
import { IValueObject } from "@common/interfaces/IValueObject";

@autoInjectable()
export class AuthValidationMiddleware implements IValueObject<RequestHandler> {
    _value : RequestHandler
    
    constructor() {
        this._value = async function (req, res , next) {
            const { username , password } = req.body
            const errors : string[] = []

            if(!username) {
                errors.push("Username field is required.")
            }

            if(!password) {
                errors.push("Password field is required.")
            }

            if(errors.length >= 1) {
                return res.status(400).json({
                    success : false,
                    errors : errors
                })
            }

            let validatedUsername : Username 
            let validatedPassword : Password

            try {
                validatedUsername = new Username(username)
            } catch (e) {
                errors.push(e.message)
            }

            try {
                validatedPassword = new Password(password)
            } catch (e) {
                errors.push(e.message)
            }

            if(errors.length >= 1) {
                return res.status(400).json({
                    success : false,
                    errors : errors
                })
            }

            req.body = {
                username : validatedUsername!,
                password : validatedPassword!
            }

            next()
        }
    }

    get value() {
        return this._value
    }
}