import { IPostgresModule } from "@modules/postgres/types";
import { TOKENS } from "src/di";
import { inject, injectable } from "tsyringe";
import { TransactionModule, Transaction, TransactionDoc, TransactionOptional , FindTransactionOptions } from "./types";
import { Client, ConnectionConfig , QueryConfig } from "pg"
import { Uuid } from "@common/uuid";
import { Username } from "@common/username";
import { DiscordId } from "@common/discordId";
import { Id } from "@common/id";
import instance from "tsyringe/dist/typings/dependency-container";

@injectable()
export class TransactionDBModule implements TransactionModule {
    private pgClient : Client | null = null
    
    constructor(@inject(TOKENS.modules.postgres) private postgres : IPostgresModule , @inject(TOKENS.values.postgresConfig) private pgConnectionConfig : ConnectionConfig) {}

    private async setPGClient() {
        this.pgClient = await this.postgres.getPGClient(this.pgConnectionConfig)
    }


    public async add(data : Transaction) : Promise<Transaction> {
        if(!this.pgClient) {
            await this.setPGClient()
        }

        const { id , status , username , discordId , devProductId , items } = data

        const query : QueryConfig = {
            name : "add-transaction",
            text : `INSERT INTO transactions(id , status , username , discordid , devProductId , items) VALUES($1,$2,$3,$4,$5,$6)`,
            values : [ id.value , status , username.value , discordId.value , devProductId.value , JSON.stringify(items) ]
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
            text : "DELETE FROM transactions WHERE id = $1",
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
        const queryText = "SELECT * FROM transactions WHERE " + (objectKeys.length === 0 ? "1 = 1;" : objectKeys.map((key , index) => `${key} = $${index + 1}` + (index + 1 === objectKeys.length ? "" : " AND ")).join("") + " LIMIT 1;")
        
        const query : QueryConfig = {
            name : "find-transaction",
            text : queryText,
            values : Object.values(opts).map((val) => val.value)
        }

        const { rows , rowCount } = await this.pgClient?.query(query)!

        if(rowCount >= 1) {
            const { id , username , discordid , items, status , devproductid , timestamp }: TransactionDoc = rows[0]
            return {
                id : new Uuid(id),
                username : new Username(username),
                discordId : new DiscordId(+discordid),
                devProductId : new Id(+devproductid),
                status,
                items,
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

        if(objectEntries.length === 0) {
            return Promise.resolve(true)
        }

        const queryOpts : QueryConfig = {
            name : "update-transaction",
            text : "UPDATE transactions SET " +
            objectEntries.map((val, index) => `${val[0]}=$${index + 1}` + `${index + 1 !== objectEntries.length ? "," : ""}`).join("") +
            ` WHERE id=$${objectEntries.length + 1}`
            ,
            values : [...objectEntries.map((val) => (Array.isArray(val[1]) ? 
            JSON.stringify(val[1]) : 
            val[1] instanceof Object ? 
            val[1].value :
            val[1]
            )) , id.value]
        }

        const { rowCount } = await this.pgClient!.query(queryOpts)
        return Promise.resolve(rowCount === 1)
    } 
}