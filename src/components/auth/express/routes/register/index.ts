import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { Router } from "express";
import { IExpressRoute } from "@common/interfaces/IExpressRoute";
import { autoInjectable, inject } from "tsyringe";
import { TOKENS } from "src/di";
import { RegisterBody } from "./types";
import { UserDBModule } from "@modules/user";
import { BCryptHash } from "@common/bcryptHash";

// MIDDLEWARES
import AuthValidationMiddleware from "@components/auth/express/middlewares/authValidation"
import IsAuthMiddleware from "@components/globalMiddlewares/isAuth"

@autoInjectable()
export class RegisterRoute implements IExpressRoute {
    constructor(
        @inject(TOKENS.modules.userDb) private userDb? : UserDBModule,
        @inject(TOKENS.values.bcryptLib) private bcryptLib? : typeof bcrypt, 
        @inject(TOKENS.values.jwtLib) private jwtLib? : typeof jwt,
        @inject(TOKENS.values.jwtSecret) private jwtSecret? : string) {}

    execute(router : Router) : void {
        router.post('/register' , IsAuthMiddleware.value, AuthValidationMiddleware.value , async (req , res) => {
            const { username , password } : RegisterBody = req.body
            try {
                const findUser = await this.userDb!.findOne({username})
                
                if(findUser) {
                    return res.status(400).json({
                        success : false,
                        errors : [
                            "This username already exists."
                        ]
                    })
                }

                const hash = await this.bcryptLib!.hash(password.value , 15)!

                const newUser = await this.userDb!.add({
                    username,
                    password : new BCryptHash(hash)
                })

                const jwtToken = this.jwtLib!.sign({
                    id : newUser.id.value,
                    username : username.value
                }, this.jwtSecret! , {
                    expiresIn : "30m",
                    subject : "Authorization",
                    issuer : "Paymet"
                })

                return res.status(200).json({success : true , token : jwtToken})
            } catch (e) {
                console.log(e)
                return res.status(500).send("Internal Server Error.")
            }  
        })
    }
}