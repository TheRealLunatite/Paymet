import { Router } from "express";
import { IExpressRoute } from "@common/interfaces/IExpressRoute";
import { ITransactionModule } from "@modules/transaction/types";
import { autoInjectable, inject } from "tsyringe";
import { TOKENS } from "src/di";
import { v4 as uuid } from "uuid";
import CreateTransactionValidationMiddleware from "../../middleware/createTransactionValidation";
import { CreateTransactionRequestValidatedBody } from "./types";
import { Uuid } from "@common/uuid";

@autoInjectable()
export class CreateTransactionRoute implements IExpressRoute {
    constructor(
        @inject(TOKENS.modules.transactionDb) private transactionDb? : ITransactionModule,
        @inject(TOKENS.values.uuid) private v4? : typeof uuid
    ) {}

    execute(router : Router) : void {
        router.post('/create' , CreateTransactionValidationMiddleware.value , async (req , res , next) => {
            const { username  , discordId , items } : CreateTransactionRequestValidatedBody = req.body

            try {
                const { id } = await this.transactionDb!.add({
                    id : new Uuid(this.v4!()),
                    status : "initalized",
                    username,
                    discordId, 
                    items
                })

                return res.status(200).json({
                    id : id.value
                })

            } catch {
                next(new Error("There was a problem creating a new transaction."))
            }
        })
    }
}