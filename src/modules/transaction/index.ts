import { PostgresModule } from "@modules/postgres/pg";
import { TOKENS } from "src/di";
import { inject, injectable } from "tsyringe";
import { ITransactionModule, Transaction, TransactionDoc, TransactionOptional } from "./types";
import { Client, ConnectionConfig , QueryConfig } from "pg"
import { Uuid } from "@common/uuid";
import { Username } from "@common/username";
import { DiscordId } from "@common/discordId";

@injectable()
export class TransactionDBModule implements ITransactionModule {
    private pgClient : Client | null = null
    
    constructor(@inject(TOKENS.modules.postgres) private postgres : PostgresModule, @inject(TOKENS.values.postgresConfig) private pgConnectionConfig : ConnectionConfig) {}

    private async setPGClient() {
        this.pgClient = await this.postgres.getPGClient(this.pgConnectionConfig)
    }

    public async add(data : Transaction) : Promise<boolean> {
        if(!this.pgClient) {
            await this.setPGClient()
        }

        const { id , status , username , discordid } = data

        const query : QueryConfig = {
            name : "add-transaction",
            text : `INSERT INTO transaction(id , status , robloxuser , discordid ) VALUES($1,$2,$3,$4)`,
            values : [ id.value , status , username.value , discordid.value ]
        }

        await this.pgClient!.query(query)
        return Promise.resolve(true)
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

        const { id : newId , status , discordid , username } = data
        const findDataById = await this.findById(id)

        if(!findDataById) {
            return Promise.resolve(false)
        }

        const query : QueryConfig = {
            name : "update-transaction",
            text : `UPDATE transaction SET status = COALESCE($1,$2) , id = COALESCE($3 , $4)::UUID , robloxuser = COALESCE($5,$6) , discordid = COALESCE($7,$8)::BIGINT WHERE id = $9`,
            values : [
                status,
                findDataById.status,
                newId?.value,
                findDataById.id.value,
                username?.value,
                findDataById.username.value,
                discordid?.value,
                findDataById.discordid.value,
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

        const [{ id : docId , status , robloxuser , discordid , timestamp }] : Array<TransactionDoc> = queryData.rows
    
        return Promise.resolve({
            id : new Uuid(docId),
            discordid : new DiscordId(+discordid),
            username : new Username(robloxuser),
            timestamp : new Date(timestamp),
            status
        })
    }

}