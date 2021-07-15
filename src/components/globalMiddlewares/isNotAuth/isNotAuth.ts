import { TOKENS } from "src/di";
import { autoInjectable, inject } from "tsyringe";
import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { IValueObject } from "@common/interfaces/IValueObject";

@autoInjectable()
export class isNotAuthMiddleware implements IValueObject<RequestHandler> {
    _value : RequestHandler
    
    constructor(@inject(TOKENS.values.jwtLib) jwtLib? : typeof jwt , @inject(TOKENS.values.jwtSecret) jwtSecret? : string) {
        this._value = async function (req, res , next) {
            const authHeader = req.headers["authorization"]
            const token = authHeader && authHeader.split(' ')[1]

            if(!token) {
                return next()
            }
            
            try {
                jwtLib!.verify(token, jwtSecret! , { issuer : "Paymet" , subject : "Authorization" })
                
                return res.status(403).json({
                    success : false,
                    errors : ["Unable to access this content because you are already authorized."]
                })

            } catch {
                return next()
            }
        }
    }

    get value() {
        return this._value
    }
}