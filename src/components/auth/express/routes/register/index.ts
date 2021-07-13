import { Router } from "express";
import { IExpressRoute } from "@common/interfaces/IExpressRoute";

export class RegisterRoute implements IExpressRoute {
    constructor() {}

    execute(router : Router) : void {
        router.post('/register' , (req , res) => {
            return res.status(200).json({success : true})
        })
    }
}