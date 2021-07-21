import { Uuid } from "@common/uuid";
import { IPostgresModule } from "@modules/postgres/types";
import { Client , ConnectionConfig, QueryConfig } from "pg";
import { TOKENS } from "src/di";
import { InventoryItem } from "./types";
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

    private sortInventory(inventory : InventoryItem[]) : InventoryItem[] {
        return inventory.map(({ itemName , itemImage , itemRarity , itemStock , itemType }) => ({
            itemName,
            itemRarity,
            itemType,
            itemImage,
            itemStock
        }))
    }

    private toPGArrayFormat(data : InventoryItem[]) {   

        if(Array.isArray(data) && data.length >= 1) {
            const pgArray = data.map((inventoryItem) => {
                let string = ""
                const values = Object.values(inventoryItem)

                values.forEach((val , index) => {
                    val = val.toString().replace(/'/gm,'')

                    if(val.length === 0) {
                        string += "''"
                    } else if (index === values.length - 1) {
                        string += +val
                    } else {
                        string += `'${val}'`
                    }

                    if(index !== values.length - 1) {
                        string += ","
                    }
                })
                
                return `(${string})`
            })
            
            return pgArray
        }
        
        return null
    }

    private parsePGArrayFormat() {}

    public async add(data : InventoryData) : Promise<InventoryData> {
        if(!this.pgClient) {
            await this.setPGClient()
        }

        const { socketId , userId , placeId , robloxUser, inventory } = data
        
        // Validate the inventory data before adding the data in.
        const query : QueryConfig = {
            name : "add-inventory",
            text : `INSERT INTO inventory(socketId , userId , placeId , robloxUser , inventory) VALUES($1,$2,$3,$4,$5::inventoryitem[])`,
            values : [socketId.value , userId.value , placeId.value , robloxUser.value , this.toPGArrayFormat(this.sortInventory(inventory))]
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