import { Uuid } from "@common/uuid";
import { IPostgresModule } from "@modules/postgres/types";
import { Client , ConnectionConfig, QueryConfig } from "pg";
import { TOKENS } from "src/di";
import { FindInventoryOpts, InventoryItem , InventoryDoc, FindType } from "./types";
import { singleton , inject } from "tsyringe";
import { InventoryModule, Inventory } from "./types";
import { Username } from "@common/username";
import { Id } from "@common/id";

@singleton()
export class InventoryDBModule implements InventoryModule {
    private pgClient : Client | null = null

    constructor(
        @inject(TOKENS.modules.postgres) private postgres : IPostgresModule,
        @inject(TOKENS.values.postgresConfig) private pgConnectionConfig : ConnectionConfig,
    ){}
    
    private async setPGClient() {
        this.pgClient = await this.postgres.getPGClient(this.pgConnectionConfig)
    }

    private sortInventory(inventory : InventoryItem[]) : InventoryItem[] {
        return inventory.map(({ itemName , itemImage , itemRarity , itemStock , itemType , itemRawName }) => ({
            itemName,
            itemRawName,
            itemRarity,
            itemType,
            itemImage,
            itemStock
        }))
    }

    private toArray(data : string) : InventoryItem[] {
        const arrOfItems = data.substr(2 , data.length - 4).replace(/'/gm , "").replace(/","/gm , "|").split("|")
        
        return arrOfItems.map((items) => {
            const [ itemName , itemRawName , itemRarity , itemType , itemImage , itemStock ] = items.substring(1,items.length - 1).split(",")

            return {
                itemName,
                itemRawName,
                itemRarity,
                itemType,
                itemImage,
                itemStock : +itemStock
            }
        })
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

    public async add(data : Inventory) : Promise<Inventory> {
        if(!this.pgClient) {
            await this.setPGClient()
        }

        const { socketId , userId , placeId , username, inventory } = data

        // Validate the inventory data before adding the data in.
        const query : QueryConfig = {
            name : "add-inventory",
            text : `INSERT INTO inventory(socketId , userId , placeId , username , inventory) VALUES($1,$2,$3,$4,$5::inventoryitem[])`,
            values : [socketId.value , userId.value , placeId.value , username.value , this.toPGArrayFormat(this.sortInventory(inventory))]
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

    private async find(opts : FindInventoryOpts , type : FindType) : Promise<Inventory | Inventory[] | null>{
        if(type !== "findAll" && type !== "findOne") {
            throw new Error("findAll and findOne is the only options allowed for type.")
        }

        const objectKeys = Object.keys(opts)
        const queryText = "SELECT * FROM inventory WHERE " + (objectKeys.length === 0 ? "1 = 1;" : objectKeys.map((key , index) => `${key} = $${index + 1}` + (index + 1 === objectKeys.length ? "" : " AND ")).join("") + " LIMIT 1;")
        
        const queryOpts : QueryConfig = {
            name : "find-inventory",
            text : queryText,
            values : Object.values(opts).map((val) => val.value)
        }

        const query = await this.pgClient?.query(queryOpts)!

        if(query.rowCount >= 1) {
            const rows : InventoryDoc[] = query.rows

            if(type === "findAll") {
                return rows.map(({ socketid , userid , placeid , username , inventory }) : Inventory => ({
                    socketId : new Uuid(socketid),
                    username : new Username(username),
                    userId : new Id(+userid),
                    placeId : new Id(+placeid),
                    inventory : this.toArray(inventory)
                }))
            } else {
                const { socketid , userid , placeid , username , inventory }: InventoryDoc = rows[0]

                return {
                    socketId : new Uuid(socketid),
                    username : new Username(username),
                    userId : new Id(+userid),
                    placeId : new Id(+placeid),
                    inventory : this.toArray(inventory)
                }
            }
        }

        return Promise.resolve(null)
    }

    public async findOne(opts : FindInventoryOpts) : Promise<Inventory | null> {
        if(!this.pgClient) {
            await this.setPGClient()
        }   

        return Promise.resolve(await this.find(opts , "findOne") as Inventory)
    }

    public async findAll(opts : FindInventoryOpts) : Promise<Inventory[] | null> {
        if(!this.pgClient) {
            await this.setPGClient()
        }   

        return Promise.resolve(await this.find(opts , "findAll") as Inventory[])
    }
}