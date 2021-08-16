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
import { Transaction } from "@modules/transaction/types";

@autoInjectable()
export class CreateTransactionRoute implements IExpressRoute {
    constructor(
        @inject(TOKENS.modules.transactionDb) private transactionDb? : TransactionModule,
        @inject(TOKENS.modules.roblox) private roblox? : IRobloxModule,
        @inject(TOKENS.values.uuid) private v4? : typeof uuid,
        @inject(TOKENS.values.robloxConfig) private robloxConfig? : { placeId : number , cookie : string }
    ) {}

    execute(router : Router) : void {
        router.post('/create' , CreateTransactionValidationMiddleware.value , ValidateItemsMiddleware.value , GetTotalPriceMiddleware.value , async (req , res , next) => {
            const { username , discordId , items } : CreateTransactionRequestValidatedBody = req.body
            const totalPriceInRobux = req.totalPriceInRobux!

            let assetId : Id | null
            let createdTransaction : Transaction

            try {
                assetId = await this.roblox!.createDeveloperProduct(new Cookie(this.robloxConfig!.cookie) , {
                    name : this.v4!(),
                    placeId : new Id(this.robloxConfig!.placeId),
                    priceInRobux : totalPriceInRobux
                })
            } catch {
                return next(new Error("There was an error creating a developer product id for your place."))
            }

            if(!assetId) {
                return res.status(500).json({
                    success : false,
                    errors : ["A developer product was unable to be created for this transaction."]
                })
            }

            try {
                createdTransaction = await this.transactionDb!.add({
                    id : new Uuid(this.v4!()),
                    status : "initalized",
                    assetId,
                    username,
                    discordId,
                    items
                })
            } catch {
                return next(new Error("There was an error adding a new transaction in the database."))
            }

            return res.status(200).json({
                id : createdTransaction.id.value,
                devProductId : assetId.value,
                totalPrice : totalPriceInRobux
            })
        })
    }
}