import { Id } from "@common/id";
import { Username } from "@common/username";
import { Uuid } from "@common/uuid";
import { IPostgresModule } from "@modules/postgres/types";
import { Client , ConnectionConfig, QueryConfig } from "pg";
import { TOKENS } from "src/di";
import { singleton , inject } from "tsyringe";
import { InstanceModule , Instance , DeleteInstanceResponse, InstanceOpts , FindType, InstanceDoc } from "./types"

@singleton()
export class InstanceDBModule implements InstanceModule {
    private pgClient : Client | null = null

    constructor(
        @inject(TOKENS.modules.postgres) private postgres : IPostgresModule,
        @inject(TOKENS.values.postgresConfig) private pgConnectionConfig : ConnectionConfig,
    ){}
    
    private async setPGClient() {
        this.pgClient = await this.postgres.getPGClient(this.pgConnectionConfig)
    }

    public async add(data : Instance) : Promise<Instance> {
        if(!this.pgClient) {
            await this.setPGClient()
        }

        const { socketId , userId , placeId , username, inventory } = data
        
        const query : QueryConfig = {
            name : "add-instance",
            text : `INSERT INTO instances (socketId , userId , placeId , username , inventory) VALUES($1,$2,$3,$4,$5)`,
            values : [socketId.value , userId.value , placeId.value , username.value , JSON.stringify(inventory)]
        }    

        await this.pgClient!.query(query)

        return Promise.resolve(data)
    }

    public async deleteById(id : Uuid) : Promise<DeleteInstanceResponse> {
        if(!this.pgClient) {
            await this.setPGClient()
        }

        const query : QueryConfig = {
            name : "delete-instance",
            text : `DELETE FROM instances WHERE socketId=$1`,
            values : [id.value]
        }

        const { rowCount } = await this.pgClient!.query(query)

        return Promise.resolve({
            deleted : rowCount
        })
    }

    private async find(data : InstanceOpts , type : FindType) : Promise<Instance | Instance[] | null> {
        if(type !== "FindAll" && type !== "FindOne") {
            throw new Error("FindAll and FindOne is the only options allowed for type.")
        }

        const objectKeys = Object.keys(data)
        const queryText = "SELECT * FROM instances WHERE " +
        ( objectKeys.length === 0 ? (
            "1 = 1;"
        ) : (
            objectKeys.map((key , index) => `${key} = $${index + 1}` + (index + 1 === objectKeys.length ? "" : " AND ")).join("") + 
            (
                type === "FindOne" ? " LIMIT 1;"  : ";"
            )
        ))

        const queryOpts : QueryConfig = {
            name : "find-inventory",
            text : queryText,
            values : Object.values(data).map((val) => val.value)
        }

        const query = await this.pgClient?.query(queryOpts)!

        if(query.rowCount >= 1) {
            const rows : InstanceDoc[] = query.rows

            if(type === "FindAll") {
                return Promise.resolve(rows.map(({ socketid , userid , placeid , username , inventory }) : Instance => ({
                    socketId : new Uuid(socketid),
                    username : new Username(username),
                    userId : new Id(+userid),
                    placeId : new Id(+placeid),
                    inventory
                })))
            }

            const { socketid , userid , placeid , username , inventory } = rows[0]

            return Promise.resolve({
                socketId : new Uuid(socketid),
                username : new Username(username),
                userId : new Id(+userid),
                placeId : new Id(+placeid),
                inventory
            })
        }

        return Promise.resolve(null)
    }

    public async findOne(data : InstanceOpts) : Promise<Instance | null> {
        if(!this.pgClient) {
            await this.setPGClient()
        }

        return Promise.resolve(await this.find(data , "FindOne") as Instance | null)
    }

    public async findAll(data : InstanceOpts) : Promise<Instance[] | null> {
        if(!this.pgClient) {
            await this.setPGClient()
        }

        return Promise.resolve(await this.find(data , "FindOne") as Instance[] | null)
    }
}