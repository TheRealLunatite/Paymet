import { ISocket } from "@common/interfaces/ISocket";
import { TOKENS } from "src/di";
import { autoInjectable, inject } from "tsyringe";
import { WebSocket } from "ws";
import { InventoryModule } from "@modules/inventory/types";
import { LoggerModule } from "@modules/logger/types";
import { RobloxUniverse } from "@common/robloxUniverse";

@autoInjectable()
export class CloseSocketListener implements ISocket {
    constructor(
        @inject(TOKENS.modules.inventoryDb) private inventoryDb? : InventoryModule,
        @inject(TOKENS.modules.logger) private logger? : LoggerModule
    ){}
    execute(ws : WebSocket) {   
        ws.on("close" , async (code , reason) => {
            try {
                await this.inventoryDb?.deleteById(ws.id)
                if(ws.user) {
                    const { username , placeId } = ws.user
                    this.logger!.info(`${username.value} has left ${RobloxUniverse[placeId.value]}.`)
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