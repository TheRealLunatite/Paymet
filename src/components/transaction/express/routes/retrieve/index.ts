import { Router } from "express";
import { IExpressRoute } from "@common/interfaces/IExpressRoute";
import { autoInjectable, inject } from "tsyringe";
import { TOKENS } from "src/di";
import { ITransactionModule } from "@modules/transaction/types";
import { Uuid } from "@common/uuid";

@autoInjectable()
export class RetrieveTransactionRoute implements IExpressRoute {
    constructor(
        @inject(TOKENS.modules.transactionDb) private transactionDb? : ITransactionModule
    ) {}

    execute(router : Router) : void {
        router.post('/retrieve' , async (req , res) => {
            const transaction = await this.transactionDb?.findById(new Uuid(req.body.id))
            
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
        })
    }
}