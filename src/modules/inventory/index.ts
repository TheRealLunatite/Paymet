import { Uuid } from "@common/uuid";
import { IPostgresModule } from "@modules/postgres/types";
import { Client , ConnectionConfig, QueryConfig } from "pg";
import { TOKENS } from "src/di";
import { InventoryItem } from "src/websocket/events/message";
import { singleton , inject } from "tsyringe";
import { IInventoryModule, InventoryData } from "./types";

@singleton()
export class InventoryDBModule implements IInventoryModule {
    private pgClient : Client | null = null

    constructor(
        @inject(TOKENS.modules.postgres) private postgres : IPostgresModule,
        @inject(TOKENS.values.postgresConfig) private pgConnectionConfig : ConnectionConfig,
    ){}
    
    private async setPGClient() {
        this.pgClient = await this.postgres.getPGClient(this.pgConnectionConfig)
    }

    private toPGArrayFormat(data : InventoryItem[]) : string | null {   
        if(Array.isArray(data) && data.length >= 1) {
            const pgArray = data.map((inventoryItem) => {
                let string = ""
                const values = Object.values(inventoryItem)

                values.forEach((val , index) => {
                    if(val.length === 0) {
                        string += "''"
                    } else {
                        string += val
                    }

                    if(index !== values.length - 1) {
                        string += ","
                    }
                })
                
                return `(${string})`
            })

            return pgArray.toString()
        }

        return null
    }

    private parsePGArrayFormat() {}

    public async add(data : InventoryData) : Promise<InventoryData> {
        if(!this.pgClient) {
            await this.setPGClient()
        }

        const { socketId , userId , placeId , robloxUser, inventory } = data

        const query : QueryConfig = {
            name : "add-inventory",
            text : "INSERT INTO inventory(socketId , userId , placeId , robloxUser , inventory) VALUES($1,$2,$3,$4,ARRAY[$5]::inventoryitem[]) RETURNING inventory;",
            values : [socketId.value , userId.value , placeId.value , robloxUser.value , this.toPGArrayFormat(inventory as unknown as InventoryItem[])]
        }

        await this.pgClient!.query(query)

        return Promise.resolve(data)
    }

    public async deleteById(id : Uuid) : Promise<boolean> {
        if(!this.pgClient) {
            await this.setPGClient()
        }

        const query : QueryConfig = {
            name : "delete-inventory",
            text : "DELETE FROM inventory WHERE socketId = $1;",
            values : [id.value]
        }

        await this.pgClient!.query(query)

        return Promise.resolve(true)
    }
}