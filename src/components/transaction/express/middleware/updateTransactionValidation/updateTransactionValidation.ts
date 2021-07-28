import { DiscordId } from "@common/discordId";
import { IExecutableValue } from "@common/interfaces/IExecutable";
import { Username } from "@common/username";
import { Uuid } from "@common/uuid";
import { RequestHandler } from "express";
import { autoInjectable } from "tsyringe";
import { UpdateTransactionRequestBody } from "../../routes/update/types";

@autoInjectable()
export class UpdateTransactionValidation implements IExecutableValue<RequestHandler> {
    constructor() {}

    public execute() : RequestHandler {
        return async (req , res , next) => {
            const errors = []
            const { id , status , discordId , username } : UpdateTransactionRequestBody = req.body

            let validatedUuid : Uuid

            if(!id) {
                return res.status(400).json({
                    success : false,
                    errors : ["Id field is missing from the body."]
                })
            }

            try {
                validatedUuid = new Uuid(id)
            } catch {
                return res.status(400).json({
                    success : false,
                    errors : ["Id field contains an invalid uuid value."]
                })
            }

            if(Object.keys(req.body).length === 1) {
                return res.status(400).json({
                    success : false,
                    errors : ["Please provide one or more field to update a transaction."]
                })
            } 

            req.body = {
                id : validatedUuid!,
                opts : {}
            }

            if((status) && ((status !== "initalized") && (status !== "pending") && (status !== "success"))) {
                errors.push("Unsupported transaction status.")
            } else {
                req.body.opts.status = status
            }

            if(discordId) {
                try {
                    req.body.opts.discordId = new DiscordId(discordId)
                } catch {
                    errors.push("DiscordId field contains an invalid snowflake.")
                }
            }

            if(username) {
                try {
                    req.body.opts.username = new Username(username)
                } catch {
                    errors.push("Username field contains a value that does not meet the username requirement.")
                }
            }

            if(errors.length >= 1) {
                return res.status(400).json({
                    success : false,
                    errors
                })
            }
            
            next()
        }
    }
}