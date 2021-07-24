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
            const { id : transactionId , status , discordId , username } : UpdateTransactionRequestBody = req.body
        
            if(!transactionId) {
                return res.status(400).json({
                    success : false,
                    errors : ["Please provide a UUID to update a exisiting transaction."]
                })
            }

            if(Object.keys(req.body).length === 1) {
                return res.status(400).json({
                    success : false,
                    errors : ["Please provide one or more values to update a transaction."]
                })
            } 

            if((status) && ((status !== "initalized") && (status !== "pending") && (status !== "success"))) {
                errors.push("Unsupported transaction status.")
            }
            
            try {
                req.body = {
                    id : new Uuid(transactionId),
                    username : username && new Username(username),
                    discordId : discordId && new DiscordId(discordId),
                    status
                }
            } catch(e) {
                errors.push(e.message)
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