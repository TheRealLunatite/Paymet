import { Router } from "express";
import { IExpressRoute } from "@common/interfaces/IExpressRoute";
import { autoInjectable, inject } from "tsyringe";
import { TOKENS } from "src/di";
import { TransactionModule , TransactionOptional } from "@modules/transaction/types";
import { UpdateTransactionValidatedRequestBody } from "./types";
import UpdateTransactionValidationMiddleware from "../../middleware/updateTransactionValidation/";

@autoInjectable()
export class UpdateTransactionRoute implements IExpressRoute {
    constructor(
        @inject(TOKENS.modules.transactionDb) private transactionDb? : TransactionModule
    ) {}

    execute(router : Router) : void {
        router.post('/update' , UpdateTransactionValidationMiddleware.value, async (req , res , next) => {
            const { id } : UpdateTransactionValidatedRequestBody = req.body
            const opts : TransactionOptional = req.body.opts

            try {
                const updatedTransaction = await this.transactionDb!.updateById(id, opts)

                if(!updatedTransaction) {
                    return res.status(400).json({
                        success : false,
                        errors : ["Transaction does not exist."]
                    })
                }

                return res.status(200).json({success : true})

            } catch (e) {
                console.log(e)
                next(new Error("There was a problem updating a transaction."))
            }
        })
    }
}