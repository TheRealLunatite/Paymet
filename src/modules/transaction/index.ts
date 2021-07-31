import { IPostgresModule } from "@modules/postgres/types";
import { TOKENS } from "src/di";
import { inject, injectable } from "tsyringe";
import { TransactionModule, Transaction, TransactionDoc, TransactionOptional , FindTransactionOptions , ItemPurchased } from "./types";
import { Client, ConnectionConfig , QueryConfig } from "pg"
import { Uuid } from "@common/uuid";
import { Username } from "@common/username";
import { DiscordId } from "@common/discordId";

@injectable()
export class TransactionDBModule implements TransactionModule {
    private pgClient : Client | null = null
    
    constructor(@inject(TOKENS.modules.postgres) private postgres : IPostgresModule , @inject(TOKENS.values.postgresConfig) private pgConnectionConfig : ConnectionConfig) {}

    private async setPGClient() {
        this.pgClient = await this.postgres.getPGClient(this.pgConnectionConfig)
    }

    private sortInventory(inventory : ItemPurchased[]) : ItemPurchased[] {
        return inventory.map(({ itemName , itemRawName , itemType , itemPurchased }) => ({
            itemName,
            itemRawName,
            itemType,
            itemPurchased
        }))
    }

    private toArray(data : string) : ItemPurchased[] {
        const arrOfItems = data.substr(2 , data.length - 4).replace(/'/gm , "").replace(/","/gm , "|").split("|")
        
        return arrOfItems.map((items) => {
            const [ itemName , itemRawName , itemType , itemPurchased ] = items.substring(1,items.length - 1).split(",")
            
            return {
                itemName,
                itemRawName,
                itemType,
                itemPurchased : +itemPurchased
            }
        })

    }

    private toPGArrayFormat(data : ItemPurchased[]) {   
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

    public async add(data : Transaction) : Promise<Transaction> {
        if(!this.pgClient) {
            await this.setPGClient()
        }

        const { id , status , username , discordId , items } = data

        const query : QueryConfig = {
            name : "add-transaction",
            text : `INSERT INTO transaction(id , status , username , discordid, items) VALUES($1,$2,$3,$4,$5)`,
            values : [ id.value , status , username.value , discordId.value , this.toPGArrayFormat(this.sortInventory(items)) ]
        }

        await this.pgClient!.query(query)
        return Promise.resolve(data)
    }

    public async deleteById(id : Uuid) : Promise<boolean> {
        if(!this.pgClient) {
            await this.setPGClient()
        }
        
        const query : QueryConfig = {
            name : "delete-transaction",
            text : "DELETE FROM transaction WHERE id = $1",
            values : [id.value]
        }

        const { rowCount } = await this.pgClient!.query(query)
        return Promise.resolve(rowCount >= 1)
    }

    public async findOne(opts : FindTransactionOptions) : Promise<Transaction | null> {
        if(!this.pgClient) {
            await this.setPGClient()
        }   

        const objectKeys = Object.keys(opts)
        const queryText = "SELECT * FROM transaction WHERE " + (objectKeys.length === 0 ? "1 = 1;" : objectKeys.map((key , index) => `${key} = $${index + 1}` + (index + 1 === objectKeys.length ? "" : " AND ")).join("") + " LIMIT 1;")
        
        const query : QueryConfig = {
            name : "find-transaction",
            text : queryText,
            values : Object.values(opts).map((val) => val.value)
        }

        const { rows , rowCount } = await this.pgClient?.query(query)!

        if(rowCount >= 1) {
            const { id , username , discordid , items, status , timestamp }: TransactionDoc = rows[0]
            return {
                id : new Uuid(id),
                username : new Username(username),
                discordId : new DiscordId(+discordid),
                status,
                items : this.toArray(items),
                timestamp : new Date(timestamp)
            }
        }

        return Promise.resolve(null)
    }

    public async updateById(id : Uuid , opts : TransactionOptional) : Promise<boolean> {
        if(!this.pgClient) {
            await this.setPGClient()
        }

        const objectEntries = Object.entries(opts)

        const query : QueryConfig = {
            name : "update-transaction",
            text : "UPDATE transaction SET " + objectEntries.map((value , index) => `${value[0]}='${typeof(value[1]) === "object" ? value[1].value : value[1]}'` + (index === objectEntries.length ? "," : "")) + " WHERE id=$1",
            values : [id.value]
        }

        const { rowCount } = await this.pgClient!.query(query)
        return Promise.resolve(rowCount === 1)
    } 
}