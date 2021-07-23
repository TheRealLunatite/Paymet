import { Router } from "express";
import { IExpressRoute } from "@common/interfaces/IExpressRoute";
import { autoInjectable } from "tsyringe";
import ValidatePaymetHeaderMiddleware from "@components/globalMiddlewares/validatePaymetHeader"

@autoInjectable()
export class UpdateTransactionRoute implements IExpressRoute {
    constructor(

    ) {}

    execute(router : Router) : void {
        router.post('/update' , ValidatePaymetHeaderMiddleware.value , async (req , res) => {
            return res.status(200).send("hello world")
        })
    }
}