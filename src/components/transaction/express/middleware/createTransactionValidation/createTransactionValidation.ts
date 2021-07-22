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
            const { discordId , robloxUser } : CreateTransactionRequestBody = req.body

            let validatedDiscordId : DiscordId
            let validatedRobloxUser : Username

            try {
                validatedDiscordId = new DiscordId(discordId)
            } catch {
                errors.push("discordId field is not a valid discord id.")
            }

            try {
                validatedRobloxUser = new Username(robloxUser)
            } catch {
                errors.push("robloxUser field is not a valid username.")
            }

            if(errors.length >= 1) {
                return res.status(400).json({
                    success : false,
                    errors
                })
            }

            req.body = {
                discordId : validatedDiscordId!,
                robloxUser : validatedRobloxUser!
            }

            next()
        }
    }
}