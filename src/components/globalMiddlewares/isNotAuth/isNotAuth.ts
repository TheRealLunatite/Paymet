import { TOKENS } from "src/di";
import { autoInjectable, inject } from "tsyringe";
import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { IExecutableValue } from "@common/interfaces/IExecutable";

@autoInjectable()
export class isNotAuthMiddleware implements IExecutableValue<RequestHandler> {
    constructor(
        @inject(TOKENS.values.jwtLib) private jwtLib? : typeof jwt,
        @inject(TOKENS.values.jwtSecret) private jwtSecret? : string
    ){}

    public execute() : RequestHandler {
        return async (req , res , next) => {
            const authHeader = req.headers["authorization"]
            const token = authHeader && authHeader.split(' ')[1]

            if(!token) {
                return next()
            }
            try {
                this.jwtLib!.verify(token, this.jwtSecret! , { issuer : "Paymet" , subject : "Authorization" })
                
                return res.status(403).json({
                    success : false,
                    errors : ["Unable to access this content because you are already authorized."]
                })

            } catch {
                return next()
            }
        }
    }
}