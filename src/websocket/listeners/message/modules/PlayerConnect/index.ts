import { WebSocket } from "ws";
import { autoInjectable, inject } from "tsyringe";
import { TOKENS } from "src/di";
import { PlayerConnect } from "../types";
import { LoggerModule } from "@modules/logger/types";
import { InstanceModule } from "@modules/instances/types";
import { ISocketModule } from "@common/interfaces/ISocketModule";
import { Username } from "@common/username";
import { Id } from "@common/id";
import { RobloxUniverse } from "@common/robloxUniverse";

@autoInjectable()
export class PlayerConnectModule implements ISocketModule {
    constructor(
        @inject(TOKENS.modules.instanceDb) private instanceDb? : InstanceModule ,
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

        // If the connect user for whatever reason is still in the database when the socket instance is closed we'll delete the doc to prevent any constraint errors.
        try {
            const findUser = await this.instanceDb!.findOne({ userId : ws.user.userId! })

            if(findUser) {
                await this.instanceDb!.deleteById(findUser.socketId)
            }
        } catch {
            throw new PlayerConnectModuleError("There was an error trying to find/delete a user in the instance database.")
        }

        try {
            await this.instanceDb!.add({
                socketId : ws.id,
                userId : userId,
                placeId : placeId,
                username :  username,
                inventory : data.inventory
            })
        } catch (e) {
            throw new PlayerConnectModuleError("There was an error adding the connected user to the instance database.")
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