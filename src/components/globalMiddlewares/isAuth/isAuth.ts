import { TOKENS } from "src/di";
import { autoInjectable, inject } from "tsyringe";
import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { IValueObject } from "@common/interfaces/IValueObject";

@autoInjectable()
export class isAuthMiddleware implements IValueObject<RequestHandler> {
    _value : RequestHandler
    
    constructor(@inject(TOKENS.values.jwtLib) jwtLib? : typeof jwt , @inject(TOKENS.values.jwtSecret) jwtSecret? : string) {
        this._value = async function (req, res , next) {
            const authHeader = req.headers["authorization"]
            const token = authHeader && authHeader.split(' ')[1]

            if(!token) {
                return res.status(401).json({
                    success : false,
                    errors : ["Authorization header is missing from the request."]
                })
            }
            
            try {
                const payload = jwtLib!.verify(token, jwtSecret! , { issuer : "Paymet" , subject : "Authorization" })
                req.user = payload
                
                return next()
            } catch (e) {
                return res.status(401).json({
                    success : false,
                    errors : [
                        'JWT : ' + e.message
                    ]
                })
            }
        }
    }

    get value() {
        return this._value
    }
}