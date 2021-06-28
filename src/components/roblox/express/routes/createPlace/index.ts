import { Router } from "express";
import { IExpressRoute } from "src/common/IExpressRoute";

export class CreatePlaceRoute implements IExpressRoute {
    constructor() {}

    execute(router : Router) : void {
        router.post('/createPlace' , (req , res) => {
            return res.status(200).json({success : true})
        })
    }
}