import { WebSocket } from "ws";
import { autoInjectable, inject } from "tsyringe";
import { TOKENS } from "src/di";
import { TradeInfo } from "../types";
import { LoggerModule } from "@modules/logger/types";
import { ISocketModule } from "@common/interfaces/ISocketModule";
import { TransactionDBModule } from "@modules/transactionDb";
import { Username } from "@common/username";
import { RobloxUniverse } from "@common/robloxUniverse";

@autoInjectable()
export class ReceivedTradeRequestModule implements ISocketModule {
    constructor(
        @inject(TOKENS.modules.transactionDb) private transactionDb? : TransactionDBModule,
        @inject(TOKENS.modules.logger) private logger? : LoggerModule
    ){}

    async execute(ws : WebSocket , data : TradeInfo) {
        if(!ws.user) {
            return ws.close(1000 , "ws.user is undefined. Call the 'PlayerConnect' message type before utilizing your script. ")
        }

        if((!data.type) || (!data.username)) {
            throw new ReceivedTradeRequestModuleError("Required data is missing to utilize this message event type.")
        }

        if(data.type !== "ReceivedTradeRequest") {
            throw new ReceivedTradeRequestModuleError("Invalid message type.")
        }

        let tradeUser : Username

        try {
            tradeUser = new Username(data.username)
        } catch (e) {
            throw new ReceivedTradeRequestModuleError("Trade username is invalid.")
        }

        const { username , userId , placeId } = ws.user!
        this.logger!.info(`${username.value} <${userId.value}> has received a trade request in ${RobloxUniverse[placeId.value]}.`)

        try {
            const transaction = await this.transactionDb!.findOne({ username : tradeUser })

            if((transaction) && (transaction.status === "initalized")) {
                console.log(transaction.items)
                
                return ws.send(JSON.stringify({
                    type : "AcceptTradeRequest",
                    username : tradeUser.value,
                    items : transaction.items
                }))
            }

            return ws.send(JSON.stringify({
                type : "DeclineTradeRequest",
                username : tradeUser.value
            }))
        } catch {
            throw new ReceivedTradeRequestModuleError("There was an error accessing the transaction database.")
        }
    }
}

export class ReceivedTradeRequestModuleError extends Error {
    constructor(message : string) {
        super(message);

        this.name = this.constructor.name;
        this.stack = new Error().stack;
    }
}