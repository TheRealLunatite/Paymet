import { IPostgresModule } from "@modules/postgres/types";
import { TOKENS } from "src/di";
import { inject, injectable } from "tsyringe";
import { ITransactionModule, Transaction, TransactionDoc, TransactionOptional } from "./types";
import { InventoryItem } from "@modules/inventory/types";
import { Client, ConnectionConfig , QueryConfig } from "pg"
import { Uuid } from "@common/uuid";
import { Username } from "@common/username";
import { DiscordId } from "@common/discordId";

@injectable()
export class TransactionDBModule implements ITransactionModule {
    private pgClient : Client | null = null
    
    constructor(@inject(TOKENS.modules.postgres) private postgres : IPostgresModule , @inject(TOKENS.values.postgresConfig) private pgConnectionConfig : ConnectionConfig) {}

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

    private toArray(data : string) {
        const arrOfItems = data.substr(2 , data.length - 4).replace(/'/gm , "").replace(/","/gm , "|").split("|")
        
        return arrOfItems.map((items) => {
            const [ itemName , itemRarity , itemType , itemImage , itemStock ] = items.substring(1,items.length - 1).split(",")
            
            return {
                itemName,
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

    public async updateById(id : Uuid , data : TransactionOptional) : Promise<boolean> { 
        if(!this.pgClient) {
            await this.setPGClient()
        }

        const { id : newId , status , discordId , username } = data
        const findDataById = await this.findById(id)

        if(!findDataById) {
            return Promise.resolve(false)
        }

        const query : QueryConfig = {
            name : "update-transaction",
            text : `UPDATE transaction SET status = COALESCE($1,$2) , id = COALESCE($3 , $4)::UUID , username = COALESCE($5,$6) , discordid = COALESCE($7,$8)::BIGINT WHERE id = $9`,
            values : [
                status,
                findDataById.status,
                newId?.value,
                findDataById.id.value,
                username?.value,
                findDataById.username.value,
                discordId?.value,
                findDataById.discordId.value,
                id.value
            ]
        }
        
        await this.pgClient?.query(query)
        return Promise.resolve(true)
    }

    public async findById(id : Uuid) : Promise<Transaction | null> {
        if(!this.pgClient) {
            await this.setPGClient()
        }

        const query : QueryConfig = {
            name : "find-transaction",
            text : "SELECT * FROM transaction WHERE id = $1",
            values : [id.value]
        }

        const queryData = await this.pgClient!.query(query)

        if(!queryData.rowCount) {
            return Promise.resolve(null)
        }

        const [{ id : docId , status , username , discordid , timestamp , items }] : Array<TransactionDoc> = queryData.rows

        return Promise.resolve({
            id : new Uuid(docId),
            discordId : new DiscordId(+discordid),
            username : new Username(username),
            status,
            items : this.toArray(items),
            timestamp : new Date(timestamp),
        })
    }

}