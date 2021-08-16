import { DiscordId } from "@common/discordId";
import { Id } from "@common/id";
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
            const errors : string[] = []
            const { username , discordId , itemPlaceId , items } : CreateTransactionRequestBody = req.body

            if(!username) {
                errors.push("Username field is missing from the body.")
            }

            if(!discordId) {
                errors.push("DiscordId field is missing from the body.")
            }

            if(!items) {
                errors.push("Items field is missing from the body.")
            }

            if(!itemPlaceId) {
                errors.push("ItemPlaceId field is missing from the body.")
            }

            if(errors.length >= 1) {
                return res.status(400).json({ success : false , errors})
            }

            let validatedDiscordId : DiscordId
            let validatedRobloxUser : Username
            let validatedItemPlaceId : Id

            try {
                validatedDiscordId = new DiscordId(discordId.toString())
            } catch {
                errors.push("DiscordId field contains an invalid snowflake.")
            }

            try {
                validatedRobloxUser = new Username(username)
            } catch {
                errors.push("Username field contains a value that does not meet the username requirement.")
            }
            
            try {
                validatedItemPlaceId = new Id(+itemPlaceId)
            } catch {
                errors.push("ItemPlaceId field contains an invalid integer.")
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

            items.forEach(({ amount , itemType , itemRawName: itemName }) => {
                if(typeof itemName !== "string") {
                    errors.push("An object in the items array field does not exist or contain a non-string value.")
                    return
                }

                if(typeof itemType !== "string") {
                    errors.push(`${itemName} <unknown> itemType does not exist or contain a non-string value.`)
                    return
                }

                if(!Number.isInteger(amount)) {
                    errors.push(`${itemName} <${itemType}> purchase amount contains a non-integer value.`)
                }

                if(amount <= 0) {
                    errors.push(`${itemName} <${itemType}> purchase amount cannot be lower or equal to 0.`)
                }
            })

            if(errors.length >= 1) {
                return res.status(400).json({ success : false , errors })
            }

            req.body = {
                username : validatedRobloxUser!,
                discordId : validatedDiscordId!,
                itemPlaceId : validatedItemPlaceId!,
                items
            }

            next()
        }
    }
}