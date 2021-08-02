import { Router } from "express";
import { autoInjectable, inject } from "tsyringe";
import { TOKENS } from "src/di";
import { v4 as uuid } from "uuid";

import { IExpressRoute } from "@common/interfaces/IExpressRoute";
import { Uuid } from "@common/uuid";

import { TransactionModule } from "@modules/transaction/types";
import { IRobloxModule } from "@modules/roblox/types";

import CreateTransactionValidationMiddleware from "../../middleware/createTransactionValidation";
import ValidateItemsMiddleware from "../../middleware/validateItems"
import GetTotalPriceMiddleware from "../../middleware/getTotalPrice"
import { Cookie } from "@common/cookie";
import { Id } from "@common/id";
import { CreateTransactionRequestValidatedBody } from "./types";

@autoInjectable()
export class CreateTransactionRoute implements IExpressRoute {
    constructor(
        @inject(TOKENS.modules.transactionDb) private transactionDb? : TransactionModule,
        @inject(TOKENS.modules.roblox) private roblox? : IRobloxModule,
        @inject(TOKENS.values.uuid) private v4? : typeof uuid
    ) {}

    execute(router : Router) : void {
        router.post('/create' , CreateTransactionValidationMiddleware.value , ValidateItemsMiddleware.value , GetTotalPriceMiddleware.value , async (req , res , next) => {
            const { username , discordId , items } : CreateTransactionRequestValidatedBody = req.body
            const totalPriceInRobux = req.totalPriceInRobux!

            try {
                const devProductId = await this.roblox!.createDeveloperProduct(new Cookie("") , {
                    name : this.v4!(),
                    placeId : new Id(5303144823),
                    priceInRobux : totalPriceInRobux
                })

                if(!devProductId) {
                    return res.status(500).json({
                        success : false,
                        errors : ['There was an error creating a developer product.']
                    })
                }

                const createTransaction = await this.transactionDb!.add({
                    id : new Uuid(this.v4!()),
                    status : "initalized",
                    devProductId,
                    username,
                    discordId,
                    items
                })

                if(!createTransaction) {
                    return res.status(500).json({
                        success : false,
                        errors : ["There was an error creating a transaction."]
                    })
                }

                return res.status(200).send({
                    id : createTransaction.id.value,
                    devProductId : createTransaction.devProductId.value,
                    totalPrice : totalPriceInRobux
                })
            } catch (e) {
                return next(e)
            }
        })
    }
}