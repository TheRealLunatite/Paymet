import { TOKENS } from "src/di";
import { autoInjectable, inject } from "tsyringe";
import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { IExecutableValue } from "@common/interfaces/IExecutable";

@autoInjectable()
export class isAuthMiddleware implements IExecutableValue<RequestHandler> {
    constructor(
        @inject(TOKENS.values.jwtLib) private jwtLib? : typeof jwt,
        @inject(TOKENS.values.jwtSecret) private jwtSecret? : string
    ) {}

    public execute() : RequestHandler {
        return async (req, res , next) => {
            const authHeader = req.headers["authorization"]
            const token = authHeader && authHeader.split(' ')[1]

            if(!token) {
                return res.status(401).json({
                    success : false,
                    errors : ["Authorization header is missing from the request."]
                })
            }
            
            try {
                const payload = this.jwtLib!.verify(token, this.jwtSecret! , { issuer : "Paymet" , subject : "Authorization" })
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
}