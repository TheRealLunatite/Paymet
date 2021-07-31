import { IPostgresModule } from "@modules/postgres/types"
import { TOKENS } from "src/di";
import { inject, injectable } from "tsyringe";
import { Client, ConnectionConfig, QueryConfig } from   "pg"
import { Item, ItemOptional, PriceModule , ItemDoc } from "./types";
import { Uuid } from "@common/uuid";

@injectable()
export class PriceDBModule implements PriceModule {
    private pgClient : Client | null = null
    
    constructor(
        @inject(TOKENS.modules.postgres) private postgres : IPostgresModule,
        @inject(TOKENS.values.postgresConfig) private pgConnectionConfig : ConnectionConfig,
    ) {}

    private async setPGClient() {
        this.pgClient = await this.postgres.getPGClient(this.pgConnectionConfig)
    }

    public async add(item : Item) : Promise<boolean> {
        if(!this.pgClient) {
            await this.setPGClient()
        }

        const { id , name , price } = item

        const query : QueryConfig = {
            name : "add-price",
            text : "INSERT INTO prices(id, name , price) VALUES($1,$2,$3)",
            values : [id.value , name , price]
        }

        await this.pgClient!.query(query)
        return Promise.resolve(true)
    }

    public async findOne(opts : ItemOptional) : Promise<null | Item>{
        if(!this.pgClient) {
            await this.setPGClient()
        }

        const objectKeys = Object.keys(opts)
        const queryText = "SELECT * FROM prices WHERE " + (objectKeys.length === 0 ? "1 = 1;" : objectKeys.map((key , index) => `${key} = $${index + 1}` + (index + 1 === objectKeys.length ? "" : " AND ")).join("") + " LIMIT 1;")
        
        const query : QueryConfig = {
            name : "find-price",
            text : queryText,
            values : Object.values(opts).map((val) => typeof(val) === "object" && val.hasOwnProperty("value") ? val.value : val)
        }

        const { rows , rowCount } = await this.pgClient!.query(query)

        if(rowCount >= 1) {
            const { name , price , id }: ItemDoc = rows[0]
            
            return Promise.resolve({
                id : new Uuid(id),
                name,
                price
            })
        }

        return Promise.resolve(null)
    }

    public async updateById(id : Uuid , opts : ItemOptional) : Promise<boolean>{
        if(!this.pgClient) {
            await this.setPGClient()
        }

        const objectEntries = Object.entries(opts)

        const query : QueryConfig = {
            name : "update-price",
            text : "UPDATE prices SET " + objectEntries.map((value , index) => `${value[0]}='${typeof(value[1]) === "object" ? value[1].value : value[1]}'` + (index === objectEntries.length ? "," : "")) + " WHERE id=$1",
            values : [id.value]
        }

        const { rowCount } = await this.pgClient!.query(query)
        return Promise.resolve(rowCount === 1)
    }

    public async deleteById(id : Uuid) {
        if(!this.pgClient) {
            await this.setPGClient()
        }

        const query : QueryConfig = {
            name : "delete-price",
            text : "DELETE FROM prices WHERE id = $1",
            values : [id.value]
        }

        const { rowCount } = await this.pgClient!.query(query)
        return Promise.resolve(rowCount >= 1)
    }
}