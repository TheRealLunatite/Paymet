import { WebSocket } from "ws";
import { autoInjectable, inject } from "tsyringe";
import { TOKENS } from "src/di";
import { PlayerConnect } from "../types";
import { LoggerModule } from "@modules/logger/types";
import { InventoryDBModule } from "@modules/inventory";
import { ISocketModule } from "@common/interfaces/ISocketModule";
import { Username } from "@common/username";
import { Id } from "@common/id";
import { RobloxUniverse } from "@common/robloxUniverse";

@autoInjectable()
export class PlayerConnectModule implements ISocketModule {
    constructor(
        @inject(TOKENS.modules.inventoryDb) private inventoryDb? : InventoryDBModule,
        @inject(TOKENS.modules.logger) private logger? : LoggerModule
    ){}

    async execute(ws : WebSocket , data : PlayerConnect) {
        if((!data.inventory) || (!data.placeId) || (!data.userId) || (!data.username) || (!data.type)) {
            throw new PlayerConnectModuleError("Required data is missing to utilize this message event type.")
        }

        if(data.type !== "PlayerConnect") {
            throw new PlayerConnectModuleError("Invalid message type.")
        }
        
        try {
            // Set the ws.user to be globally accessed by the other message events.
            ws.user = {
                username : new Username(data.username),
                userId : new Id(data.userId),
                placeId : new Id(data.placeId)
            }
        } catch (e) {
            throw new PlayerConnectModuleError(e.mesage)
        }

        const { username , userId , placeId } = ws.user

        try {
            await this.inventoryDb!.add({
                socketId : ws.id,
                userId : userId,
                placeId : placeId,
                username :  username,
                inventory : data.inventory
            })
        } catch (e) {
            throw new PlayerConnectModuleError("There was an error adding the connected user to the inventory database.")
        }

        this.logger!.info(`${username.value} <${userId.value}> has joined ${RobloxUniverse[placeId.value]}.`)
    }
}

export class PlayerConnectModuleError extends Error {
    constructor(message : string) {
        super(message);

        this.name = this.constructor.name;
        this.stack = new Error().stack;
    }
}