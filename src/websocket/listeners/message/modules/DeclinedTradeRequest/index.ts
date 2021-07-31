import { WebSocket } from "ws";
import { autoInjectable, inject } from "tsyringe";
import { TOKENS } from "src/di";
import { TradeInfo } from "../types";
import { LoggerModule } from "@modules/logger/types";
import { ISocketModule } from "@common/interfaces/ISocketModule";
import { Username } from "@common/username";
import { RobloxUniverse } from "@common/robloxUniverse";

@autoInjectable()
export class DeclinedTradeRequestModule implements ISocketModule {
    constructor(
        @inject(TOKENS.modules.logger) private logger? : LoggerModule
    ){}

    async execute(ws : WebSocket , data : TradeInfo) {
        if(!ws.user) {
            return ws.close(1000 , "ws.user is undefined. Call the 'PlayerConnect' message type before utilizing your script. ")
        }
        
        if(((!data.username) || (!data.type))) {
            throw new DeclinedTradeRequestModuleError("Required data is missing to utilize this message event type.")
        }

        if(data.type !== "DeclinedTradeRequest") {
            throw new DeclinedTradeRequestModuleError("Invalid message type.")
        }

        try {
            const tradeUser = new Username(data.username)
            const { username , userId , placeId } = ws.user!

            this.logger!.log(`${username.value} <${userId.value}> has declined ${tradeUser.value} trade request in ${RobloxUniverse[placeId.value]}.`)
        } catch {
            throw new DeclinedTradeRequestModuleError("Trade username is invalid.")
        }
    }
}

export class DeclinedTradeRequestModuleError extends Error {
    constructor(message : string) {
        super(message);

        this.name = this.constructor.name;
        this.stack = new Error().stack;
    }
}