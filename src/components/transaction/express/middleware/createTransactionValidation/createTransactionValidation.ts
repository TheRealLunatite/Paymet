import { DiscordId } from "@common/discordId";
import { IExecutableValue } from "@common/interfaces/IExecutable";
import { Username } from "@common/username";
import { RequestHandler } from "express";
import { autoInjectable } from "tsyringe";
import { CreateTransactionRequestBody } from "../../routes/create/types";

@autoInjectable()
export class CreateTransactionValidation implements IExecutableValue<RequestHandler> {
    constructor() {}

    public execute() : RequestHandler {
        return async (req , res , next) => {
            const errors = []
            const { username , discordId , items } : CreateTransactionRequestBody = req.body

            if(!username) {
                errors.push("Username field is missing from the body.")
            }

            if(!discordId) {
                errors.push("DiscordId field is missing from the body.")
            }

            if(!items) {
                errors.push("Items field is missing from the body.")
            }

            if(errors.length >= 1) {
                return res.status(400).json({ success : false , errors})
            }

            let validatedDiscordId : DiscordId
            let validatedRobloxUser : Username

            try {
                validatedDiscordId = new DiscordId(discordId)
            } catch {
                errors.push("DiscordId field contains an invalid snowflake.")
            }

            try {
                validatedRobloxUser = new Username(username)
            } catch {
                errors.push("Username field contains a value that does not meet the username requirement.")
            }

            if(!Array.isArray(items)) {
                errors.push("Items field must contain a array value.")
            } 

            if(errors.length >= 1) {
                return res.status(400).json({ success : false , errors})
            }

            if(items.length <= 0) {
                return res.status(400).json({ success : false , errors : ["Items field cannot contain an empty array."] })
            }

            req.body = {
                username : validatedRobloxUser!,
                discordId : validatedDiscordId!,
                items
            }

            next()
        }
    }
}