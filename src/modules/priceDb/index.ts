import { IPostgresModule } from "@modules/postgres/types"
import { TOKENS } from "src/di";
import { inject, singleton } from "tsyringe";
import { Client, ConnectionConfig, QueryConfig } from   "pg"
import { Item, ItemOptional, PriceModule , ItemDoc , FindType } from "./types";
import { Uuid } from "@common/uuid";
import { Id } from "@common/id";

@singleton()
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

        const { id , itemName , itemPlaceId , priceInRobux } = item

        const query : QueryConfig = {
            name : "add-price",
            text : "INSERT INTO prices(id, itemname , itemplaceid , priceinrobux) VALUES($1,$2,$3,$4)",
            values : [id.value , itemName , itemPlaceId.value , priceInRobux]
        }

        await this.pgClient!.query(query)
        return Promise.resolve(true)
    }

    private async find(data : ItemOptional , type : FindType) : Promise<Item | Item[] | null> {
        if(type !== "FindAll" && type !== "FindOne") {
            throw new Error("FindAll and FindOne is the only options allowed for type.")
        }

        const objectKeys = Object.keys(data)
        const queryText = "SELECT * FROM prices WHERE " +
        ( objectKeys.length === 0 ? (
            "1 = 1;"
        ) : (
            objectKeys.map((key , index) => `${key} = $${index + 1}` + (index + 1 === objectKeys.length ? "" : " AND ")).join("") + 
            (
                type === "FindOne" ? " LIMIT 1;"  : ";"
            )
        ))

        const queryOpts : QueryConfig = {
            name : "find-price",
            text : queryText,
            values : Object.values(data).map((val) => val instanceof Object ? val.value : val)
        }

        const query = await this.pgClient?.query(queryOpts)!

        if(query.rowCount >= 1) {
            const rows : ItemDoc[] = query.rows

            if(type === "FindAll") {
                return Promise.resolve(rows.map(({ id , itemname , itemplaceid , priceinrobux }) : Item => ({
                    id : new Uuid(id),
                    itemName : itemname,
                    itemPlaceId : new Id(+itemplaceid),
                    priceInRobux : +priceinrobux
                })))
            }

            const { id , itemname , itemplaceid , priceinrobux } = rows[0]

            return Promise.resolve({
                id : new Uuid(id),
                itemName : itemname,
                itemPlaceId : new Id(+itemplaceid),
                priceInRobux : +priceinrobux
            })
        }

        return Promise.resolve(null)
    }

    public async findOne(opts : ItemOptional) : Promise<null | Item>{
        if(!this.pgClient) {
            await this.setPGClient()
        }

        return Promise.resolve(await this.find(opts , "FindOne") as Item | null)
    }

    public async findAll(opts : ItemOptional) : Promise<null | Item[]>{
        if(!this.pgClient) {
            await this.setPGClient()
        }

        return Promise.resolve(await this.find(opts , "FindAll") as Item[] | null)
    }

    public async updateById(id : Uuid , opts : ItemOptional) : Promise<boolean>{
        if(!this.pgClient) {
            await this.setPGClient()
        }

        const objectEntries = Object.entries(opts)

        const query : QueryConfig = {
            name : "update-price",
            text : "UPDATE prices SET " + objectEntries.map((value , index) => `${value[0]}='${value[1] instanceof Uuid ? value[1].value : value[1]}'` + (index === objectEntries.length ? "," : "")) + " WHERE id=$1",
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