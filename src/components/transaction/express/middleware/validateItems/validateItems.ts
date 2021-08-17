
import { IExecutableValue } from "@common/interfaces/IExecutable";
import { Instance , InstanceModule } from "@modules/instanceDb/types";
import { RequestHandler } from "express";
import { TOKENS } from "src/di";
import { autoInjectable, inject } from "tsyringe";
import { CreateTransactionRequestValidatedBody } from "../../routes/create/types";

@autoInjectable()
export class ValidateItems implements IExecutableValue<RequestHandler> {
    constructor(
        @inject(TOKENS.modules.instanceDb) private instanceDb? : InstanceModule
    ) {}

    public execute() : RequestHandler {
        return async (req , res , next) => {
            const { itemPlaceId , items } : CreateTransactionRequestValidatedBody = req.body

            // Place inventory is the entire inventory of a specific game that a socket instance is connected to.
            let placeInventory : Instance | null;

            try {
                placeInventory = await this.instanceDb!.findOne({ placeId : itemPlaceId })

                if(!placeInventory) {
                    return res.status(400).json({
                        success : false,
                        errors : [
                            `There is no socket instance that is active in the provided placeId.`
                        ]
                    })
                }
            } catch {
                next(new Error("There was a problem accessing the findInventory database."))
            }

            const purchasedInventoryItems : InventoryItem[] = []
            const errors : string[] = []

            try {   
                items.forEach((x) => {
                    const findItem = placeInventory!.inventory.find((y) => (x.itemRawName === y.itemRawName) && (x.itemType === y.itemType))

                    if(!findItem) {
                        errors.push(`${x.itemRawName} <${x.itemType}> does not exist in the inventory.`)
                        return
                    } 

                    if(+x.amount > findItem.itemStock) {
                        errors.push(`${x.itemRawName} <${x.itemType}> cannot be purchased at this time because it exceeds our stock.`)
                        return
                    }

                    purchasedInventoryItems.push(findItem)
                })
            } catch (e) {
                return next(new Error("There was something wrong while filtering items in your inventory."))
            }

            if(errors.length >= 1) {
                return res.status(400).json({
                    success : false,
                    errors
                })
            }

            req.inventory = purchasedInventoryItems
            next()
        }
    }
}