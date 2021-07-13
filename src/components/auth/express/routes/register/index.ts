import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { Router } from "express";
import { IExpressRoute } from "@common/interfaces/IExpressRoute";
import { autoInjectable, inject } from "tsyringe";
import { TOKENS } from "src/di";

@autoInjectable()
export class RegisterRoute implements IExpressRoute {
    constructor(
        @inject(TOKENS.values.bcryptLib) private bcryptLib? : typeof bcrypt, 
        @inject(TOKENS.values.jwtLib) private jwtLib? : typeof jwt,
        @inject(TOKENS.values.jwtSecret) private jwtSecret? : string) {}

    execute(router : Router) : void {
        router.post('/register' , async (req , res) => {
            const { username , password } = req.body
            const jwtToken = this.jwtLib?.sign({
                username : username
            }, this.jwtSecret!)

            return res.status(200).json({success : true , token : jwtToken})
        })
    }
}