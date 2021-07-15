import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import AuthValidationMiddleware from "@components/auth/express/middlewares/authValidation"
import { Router } from "express";
import { IExpressRoute } from "@common/interfaces/IExpressRoute";
import { autoInjectable, inject } from "tsyringe";
import { TOKENS } from "src/di";
import { RequestBody } from "./types";
import { UserDBModule } from "@modules/user";

@autoInjectable()
export class LoginRoute implements IExpressRoute {
    constructor(
        @inject(TOKENS.modules.userDb) private userDb? : UserDBModule,
        @inject(TOKENS.values.bcryptLib) private bcryptLib? : typeof bcrypt, 
        @inject(TOKENS.values.jwtLib) private jwtLib? : typeof jwt,
        @inject(TOKENS.values.jwtSecret) private jwtSecret? : string) {}

    execute(router : Router) : void {
        router.post('/login' , AuthValidationMiddleware.value , async (req , res) => {
            const { username , password } : RequestBody = req.body
            
            try {
                const findUser = await this.userDb!.findOne({ username })

                if(!findUser) {
                    return res.status(400).json({
                        success : false,
                        errors : ["This user does not exist."]
                    })
                }

                const userHash = findUser.password.value

                if(!await this.bcryptLib!.compare(password.value , userHash)) {
                    return res.status(401).json({
                        success : false,
                        errors : ["Incorrect password."]
                    })
                } 

                const jwtToken = this.jwtLib!.sign({
                    id : findUser.id.value,
                    username : findUser.username.value
                }, this.jwtSecret! , {
                    expiresIn : "30m",
                    subject : "Authorization",
                    issuer : "Paymet"
                })
                
                return res.status(200).json({
                    success : true,
                    token : jwtToken
                })
            } catch (e) {
                return res.status(500).send("Internal Server Error.")
            }
        }) 
    }
}