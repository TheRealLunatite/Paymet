
import { IExecutableValue } from "@common/interfaces/IExecutable";
import { PriceModule } from "@modules/prices/types";
import { RequestHandler } from "express";
import { TOKENS } from "src/di";
import { autoInjectable, inject } from "tsyringe";

@autoInjectable()
export class GetTotalPrice implements IExecutableValue<RequestHandler> {
    constructor(
        @inject(TOKENS.modules.priceDb) private priceDb? : PriceModule
    ) {}

    public execute() : RequestHandler {
        return async (req , res , next) => {
            const errors : string[] = []
            const purchasedInventoryItems = req.inventory!
            
            let totalAmountInRobux = 0
            
            try {
                for(const { itemRawName , itemName , itemType } of purchasedInventoryItems) {
                    const findPrice = await this.priceDb!.findOne({ itemName })
    
                    if(!findPrice) {
                        errors.push(`${itemRawName} <${itemType}> is currently not up for sale.`)
                    } else {
                        totalAmountInRobux += +findPrice.priceInRobux
                    }
                }
            } catch {
                return next(new Error("There was an error fetching the prices of your purchased items."))
            }

            if(errors.length >= 1) {
                return res.status(400).json({
                    success : false,
                    errors
                })
            }    

            req.totalPriceInRobux = totalAmountInRobux
            next()
        }
    }
}