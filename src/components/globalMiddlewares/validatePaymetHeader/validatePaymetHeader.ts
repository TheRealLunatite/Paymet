import { IExecutableValue } from "@common/interfaces/IExecutable";
import { RequestHandler } from "express";
import { TOKENS } from "src/di";
import { autoInjectable, inject } from "tsyringe";
import { HashModule } from "@modules/hmac/types";

@autoInjectable()
export class ValidatePaymetHeader implements IExecutableValue<RequestHandler> {
    constructor(
        @inject(TOKENS.modules.hmac) private hmac? : HashModule
    ){}

    public execute() : RequestHandler {
        return async (req , res , next) => {
            const body : unknown = req.body
            const signatureHeader = req.headers["paymet-signature"] as string | null
            const signature = signatureHeader && signatureHeader.split(" ")[0]
        
            if(!signature) {
                return res.status(400).json({
                    success : false,
                    errors : ["Paymet-Signature header is missing."]
                })
            }

            const [ timestampScheme , signatureScheme ] = signature.split(",")

            const [ tName , tValue ] = timestampScheme.split("=")
            const [ vName , vValue ] = signatureScheme.split("=")

            if(tName !== "t" || !tValue) {
                return res.status(400).json({
                    success : false,
                    errors : [ "Please provide a valid t schema in Paymet-Signature header." ]
                })
            }

            if(vName !== "v" || !vValue) {
                return res.status(400).json({
                    success : false,
                    errors : [ "Please provide a valid v schema in Paymet-Signature header." ]
                })
            }

            if(!this.hmac!.compare(JSON.stringify(body) , vValue)) {
                return res.status(400).json({
                    success : false,
                    errors : ["Invalid signature."]
                })
            }

            if(!req.body._) {
                return res.status(400).json({
                    success : false,
                    errors : ["_ field is missing from the request body."]
                })
            }

            if(!Number.isInteger(+tValue) || !Number.isInteger(+req.body._)) {
                return res.status(400).json({
                    success : false,
                    errors : ["Invalid timestamp in header or request body."]
                })
            }

            // We can confirm that the timestamp in the body hasn't been tampered with because we already have a check above
            // to check if the signature matches the body and can perform a replay attack check.
            if(+req.body._ !== +tValue) {
                return res.status(400).json({
                    success : false,
                    errors : "Timestamp in header does not match the timestamp in the signature."
                })
            }

            // If the current epoch time is older than the timestamp in the signature by 30 seconds.
            if(Math.floor(Date.now() / 1000) > +tValue + (1000 * 10)) {
                return res.status(400).json({
                    success : false,
                    errors : ["Expired timestamp."]
                })
            }
        
            return next()
        }
    }
}