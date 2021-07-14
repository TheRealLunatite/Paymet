import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import RegisterValidationMiddleware from "@components/auth/express/middlewares/registerValidation"
import { Router } from "express";
import { IExpressRoute } from "@common/interfaces/IExpressRoute";
import { autoInjectable, inject } from "tsyringe";
import { TOKENS } from "src/di";
import { RegisterBody } from "./types";
import { UserDBModule } from "@modules/user";
import { BCryptHash } from "@common/bcryptHash";

@autoInjectable()
export class RegisterRoute implements IExpressRoute {
    constructor(
        @inject(TOKENS.modules.userDb) private userDb? : UserDBModule,
        @inject(TOKENS.values.bcryptLib) private bcryptLib? : typeof bcrypt, 
        @inject(TOKENS.values.jwtLib) private jwtLib? : typeof jwt,
        @inject(TOKENS.values.jwtSecret) private jwtSecret? : string) {}

    execute(router : Router) : void {
        router.post('/register' , RegisterValidationMiddleware.value , async (req , res) => {
            const { username , password } : RegisterBody = req.body
            try {
                const findUser = await this.userDb?.findOne({username})
                
                if(findUser) {
                    return res.status(400).json({
                        success : false,
                        errors : [
                            "This username already exists."
                        ]
                    })
                }

                const hash = await this.bcryptLib?.hash(password.value , 15)!
                const jwtToken = this.jwtLib?.sign({
                    username : username.value
                }, this.jwtSecret!)

                await this.userDb?.add({
                    username,
                    password : new BCryptHash(hash)
                })

                return res.status(200).json({success : true , token : jwtToken})
            } catch (e) {
                return res.status(500).send("Internal Server Error.")
            }  
        })
    }
}