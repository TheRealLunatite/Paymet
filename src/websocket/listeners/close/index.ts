import { ISocket } from "@common/interfaces/ISocket";
import { TOKENS } from "src/di";
import { autoInjectable, inject } from "tsyringe";
import { WebSocket } from "ws";
import { InstanceModule } from "@modules/instanceDb/types"
import { LoggerModule } from "@modules/logger/types";
import { RobloxUniverse } from "@common/robloxUniverse";

@autoInjectable()
export class CloseSocketListener implements ISocket {
    constructor(
        @inject(TOKENS.modules.instanceDb) private instanceDb? : InstanceModule,
        @inject(TOKENS.modules.logger) private logger? : LoggerModule
    ){}
    execute(ws : WebSocket) {   
        ws.on("close" , async (code , reason) => {
            try {
                await this.instanceDb?.deleteById(ws.id)
                if(ws.user) {
                    const { username , placeId , userId } = ws.user
                    this.logger!.info(`${username.value} <${userId.value}> has left ${RobloxUniverse[placeId.value]}.`)
                } else {
                    await this.logger!.error("Unable to log disconnection data. <ws.user> is undefined.")
                }
            } catch {
                if(ws.user) {
                    const { username } = ws.user
                    this.logger!.error(`There was a problem removing the connected ${username.value} from the database.`)
                } else {
                    await this.logger!.error("Unable to log disconnection error. <ws.user> is undefined.")
                }
            }
        })
    }
}