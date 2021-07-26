import { Router } from "express";
import { IExpressRoute } from "@common/interfaces/IExpressRoute";
import { autoInjectable, inject } from "tsyringe";
import { TOKENS } from "src/di";
import { ITransactionModule } from "@modules/transaction/types";
import { UpdateTransactionValidatedBody } from "./types";
import RetrieveTransactionValidationMiddleware from "../../middleware/retrieveTransactionValidation"

@autoInjectable()
export class RetrieveTransactionRoute implements IExpressRoute {
    constructor(
        @inject(TOKENS.modules.transactionDb) private transactionDb? : ITransactionModule
    ) {}

    execute(router : Router) : void {
        router.post('/retrieve' , RetrieveTransactionValidationMiddleware.value , async (req , res , next) => {
            try {
                const { id } : UpdateTransactionValidatedBody = req.body
                const transaction = await this.transactionDb?.findById(id)
            
                if(!transaction) {
                    return res.status(400).json({
                        success : false,
                        errors : ["Transaction does not exist."]
                    })
                }

                return res.status(200).json({
                    id : transaction.id.value,
                    discordId : transaction.discordId.value,
                    username : transaction.username.value,
                    status : transaction.status,
                    items : transaction.items,
                    timestamp : transaction.timestamp!.toUTCString()
                })
            } catch {
                next(new Error("There was a problem retrieve information on a transaction."))
            }
        })
    }
}