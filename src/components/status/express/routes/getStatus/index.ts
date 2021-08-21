import { Router } from "express";
import { IExpressRoute } from "@common/interfaces/IExpressRoute";

export class GetStatusRoute implements IExpressRoute {
    constructor() {}

    execute(router : Router) : void {
        router.get('/ping' , (req , res) => {
            return res.status(200).send("im alive")
        })
    }
}