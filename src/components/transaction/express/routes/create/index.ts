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

            try {
                const createTransaction = await this.transactionDb!.add({
                    id : new Uuid(this.v4!()),
                    status : "initalized",
                    username,
                    discordId,
                    devProductId : new Id(1),
                    items
                })

                return res.send('hi')
            } catch (e) {
                return next(e)
            }
        })
    }
}