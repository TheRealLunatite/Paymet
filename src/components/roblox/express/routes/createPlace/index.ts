import { Router } from "express";
import { IExpressRoute } from "@common/interfaces/IExpressRoute";

export class CreatePlaceRoute implements IExpressRoute {
    constructor() {}

    execute(router : Router) : void {
        router.post('/login' , (req , res) => {
            return res.status(200).json({success : true})
        })
    }
}