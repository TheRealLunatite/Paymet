import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import RegisterValidationMiddleware from "../../middlewares/registerValidation"
import { Router } from "express";
import { IExpressRoute } from "@common/interfaces/IExpressRoute";
import { autoInjectable, inject } from "tsyringe";
import { TOKENS } from "src/di";
import { RegisterBody } from "./types";
import { UserDBModule } from "@modules/user";
import { Password } from "@common/password";
import { Id } from "@common/id";

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
            const hashPassword = await this.bcryptLib?.hash(password.value , 15)

            const jwtToken = this.jwtLib?.sign({
                username : username.value
            }, this.jwtSecret!)

            try {
                await this.userDb?.add({
                    username : username,
                    password : new Password(hashPassword!)
                })
            } catch {
                return res.status(500).json({success : false , errors : [
                    "This username already exists in our database."
                ]})
            }

            return res.status(200).json({success : true , token : jwtToken})
        })
    }
}