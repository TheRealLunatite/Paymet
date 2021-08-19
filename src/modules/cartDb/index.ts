import { DiscordId } from "@common/discordId";
import { IPostgresModule } from "@modules/postgres/types";
import { Client , ConnectionConfig, QueryConfig } from "pg";
import { TOKENS } from "src/di";
import { singleton , inject } from "tsyringe";
import { Cart, CartDoc, CartItemSanitize, CartModule, CartOpts , CountCartResponse, FindType } from "./types";

@singleton()
export class CartDBModule implements CartModule {
    private pgClient : Client | null = null

    constructor(
        @inject(TOKENS.modules.postgres) private postgres : IPostgresModule,
        @inject(TOKENS.values.postgresConfig) private pgConnectionConfig : ConnectionConfig,
    ){}
    
    private async setPGClient() {
        this.pgClient = await this.postgres.getPGClient(this.pgConnectionConfig)
    }

    public async add(data : Cart) : Promise<Cart> {
        if(!this.pgClient) {
            await this.setPGClient()
        }

        const { discordId , cart } = data
        const sanitizeCart = cart.map(({ placeId }) => placeId.value)

        const queryOpts : QueryConfig = {
            name : "add-cart",
            text : `INSERT INTO cart (discordId , cart) VALUES($1,$2)`,
            values : [discordId.value , JSON.stringify(sanitizeCart)]
        }    

        await this.pgClient!.query(queryOpts)
        return Promise.resolve(data)
    }

    private async find(data : CartOpts , type : FindType) : Promise<Cart | Cart[] | null> {
        if(type !== "FindAll" && type !== "FindOne") {
            throw new Error("FindAll and FindOne is the only options allowed for type.")
        }

        const objectKeys = Object.keys(data)
        const queryText = "SELECT * FROM cart WHERE " +
        ( objectKeys.length === 0 ? (
            "1 = 1;"
        ) : (
            objectKeys.map((key , index) => `${key} = $${index + 1}` + (index + 1 === objectKeys.length ? "" : " AND ")).join("") + 
            (
                type === "FindOne" ? " LIMIT 1;"  : ";"
            )
        ))
        
        const queryOpts : QueryConfig = {
            name : "find-cart",
            text : queryText,
            values : Object.values(data).map((val) => Array.isArray(val) ? 
                JSON.stringify(val.map(({ placeId }) => placeId.value )) : 
                val.value
            )
        }

        const query = await this.pgClient?.query(queryOpts)!

        if(query.rowCount >= 1) {
            const rows : CartDoc[] = query.rows

            if(type === "FindAll") {
                return Promise.resolve(
                    rows.map(({ discordid , cart }) => ({
                        discordId : new DiscordId(discordid),
                        cart
                    }))
                )
            }

            const { discordid , cart } = rows[0]

            return Promise.resolve({
                discordId : new DiscordId(discordid),
                cart
            })
        }

        return Promise.resolve(null)
    }

    public async findOne(data : CartOpts) : Promise<Cart | null> {
        if(!this.pgClient) {
            await this.setPGClient()
        }

        return Promise.resolve(await this.find(data , "FindOne") as Cart | null)
    }

    public async findAll(data : CartOpts) : Promise<Cart[] | null> {
        if(!this.pgClient) {
            await this.setPGClient()
        }

        return Promise.resolve(await this.find(data , "FindAll") as Cart[] | null)
    }


    public async updateById(id : DiscordId , opts : CartOpts) : Promise<boolean> {
        if(!this.pgClient) {
            await this.setPGClient()
        }

        const objectEntries = Object.entries(opts)

        if(objectEntries.length === 0) {
            return Promise.resolve(true)
        }

        const queryOpts : QueryConfig = {
            name : "update-cart",
            text : "UPDATE cart SET " +
            objectEntries.map((val, index) => `${val[0]}=$${index + 1}` + `${index + 1 !== objectEntries.length ? "," : ""}`).join("") +
            ` WHERE discordId=$${objectEntries.length + 1}`
            ,
            values : [...objectEntries.map((val) => (
                Array.isArray(val[1]) ? 
                JSON.stringify(val[1].map((cartItem) => ({ ...cartItem , placeId : cartItem.placeId.value }))) : 
                val[1].value
            )) , id.value]
        }

        const { rowCount } = await this.pgClient!.query(queryOpts)
        return Promise.resolve(rowCount >= 1)
    }

    public async getCount() : Promise<CountCartResponse> {
        if(!this.pgClient) {
            await this.setPGClient()
        }

        const queryOpts : QueryConfig = {
            name : "get-cart-count",
            text : "SELECT COUNT(*) FROM cart;"
        }

        const { rows } = await this.pgClient!.query(queryOpts)
        return Promise.resolve({
            count : +rows[0].count
        })
    }
}