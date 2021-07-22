import { ISocket } from "@common/interfaces/ISocket";
import { TOKENS } from "src/di";
import { autoInjectable, inject } from "tsyringe";
import { WebSocket } from "ws";
import { IInventoryModule } from "@modules/inventory/types";
import { Uuid } from "@common/uuid";

@autoInjectable()
export class CloseSocketListener implements ISocket {
    constructor(
        @inject(TOKENS.modules.inventoryDb) private inventoryDb? : IInventoryModule
    ){}
    execute(ws : WebSocket) {   
        ws.on("close" , async (code , reason) => {
            console.log(ws.id)
            try {
                await this.inventoryDb?.deleteById(new Uuid(ws.id))
                console.log('Removed')
            } catch(e) {
                console.log(e)
            }
        })
    }
}