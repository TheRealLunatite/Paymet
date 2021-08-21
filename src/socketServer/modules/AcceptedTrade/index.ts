import { WebSocket } from "ws";
import { autoInjectable, inject } from "tsyringe";
import { TOKENS } from "src/di";
import { ISocketModule } from "@common/interfaces/ISocketModule";
import { TransactionDBModule } from "@modules/transactionDb";
import { AcceptedTradeData } from "./types";
import { Uuid } from "@common/uuid";
import { LoggerModule } from "@modules/logger/types";

@autoInjectable()
export class AcceptedTradeModule implements ISocketModule {
    constructor(
        @inject(TOKENS.modules.transactionDb) private transactionDb? : TransactionDBModule,
        @inject(TOKENS.modules.logger) private logger? : LoggerModule
    ){}

    async execute(ws : WebSocket , data : AcceptedTradeData) {
        if(!ws.user) {
            return ws.close(1000 , "ws.user is undefined. Call the 'PlayerConnect' message type before utilizing your script. ")
        }
        
        if(!data.type && !data.transactionId) {
            throw new AcceptedTradeModuleError("Required data is missing to utilize this message event type.")
        }

        if(data.type !== "AcceptedTradeRequest") {
            throw new AcceptedTradeModuleError("Invalid message type.")
        }
        
        const tradedItems = data.items
        const transactionId = new Uuid(data.transactionId)
        const transaction = await this.transactionDb!.findOne({ id : transactionId })

        if(!transaction) {
            throw new AcceptedTradeModuleError("Transaction cannot be found.")
        }   

        const itemsPurchased = transaction.items

        // Validate each traded item.
        tradedItems.forEach((tradedItem) => {
            if(!tradedItem.hasOwnProperty("itemRawName") || 
                !tradedItem.hasOwnProperty("itemType") || 
                !tradedItem.hasOwnProperty("itemRarity") || 
                !tradedItem.hasOwnProperty("itemPlaceId")
            ) {
                throw new AcceptedTradeModuleError("Data is missing.")
            }
        })

        tradedItems.forEach((tradedItem) => {
            const findTransactionItemIndex = itemsPurchased.findIndex(({ itemType , itemRawName , itemPlaceId , itemRarity}) =>  
                itemType === tradedItem.itemType && 
                itemRawName === tradedItem.itemRawName && 
                itemPlaceId.value === +tradedItem.itemPlaceId && 
                itemRarity === tradedItem.itemRarity
            )

            if(findTransactionItemIndex === -1) {
                return
            }

            const transactionItem = itemsPurchased[findTransactionItemIndex]

            if(transactionItem.itemReceived) {
                return
            }

            itemsPurchased[findTransactionItemIndex] = {
                ...transactionItem,
                itemReceived : true
            }
        })

        if(itemsPurchased.filter(({ itemReceived }) => !itemReceived).length) {
            await this.transactionDb!.updateById(transactionId , { status : "success" })
        } else {
            await this.transactionDb!.updateById(transactionId, { items : itemsPurchased }) 
        }

        this.logger!.log(`Transaction updated. ${data.items.length}`)
    }
}

export class AcceptedTradeModuleError extends Error {
    constructor(message : string) {
        super(message);

        this.name = this.constructor.name;
        this.stack = new Error().stack;
    }
}