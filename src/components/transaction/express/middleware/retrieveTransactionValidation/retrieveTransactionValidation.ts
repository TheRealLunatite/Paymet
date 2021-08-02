import { IExecutableValue } from "@common/interfaces/IExecutable";
import { Uuid } from "@common/uuid";
import { RequestHandler } from "express";
import { autoInjectable } from "tsyringe";
import { RetrieveTransactionRequestBody } from "./types";

@autoInjectable()
export class RetrieveTransactionValidation implements IExecutableValue<RequestHandler> {
    constructor() {}

    public execute() : RequestHandler {
        return async (req , res , next) => {
            const { id } : RetrieveTransactionRequestBody = req.body
            
            if(!id) {
                return res.status(400).json({
                    success : false,
                    errors : [
                        "Id is missing from the body."
                    ]
                })
            }

            req.body = {}

            try {
                req.body.id = new Uuid(id)
            } catch {
                return res.status(400).json({
                    success : false,
                    errors : ["Id field does not contain a valid UUID value."]
                })
            }

            next()
        }
    }
}