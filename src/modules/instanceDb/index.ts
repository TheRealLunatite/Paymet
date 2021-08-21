import { Id } from "@common/id";
import { Username } from "@common/username";
import { Uuid } from "@common/uuid";
import { IPostgresModule } from "@modules/postgres/types";
import { Client , ConnectionConfig, QueryConfig } from "pg";
import { TOKENS } from "src/di";
import { singleton , inject } from "tsyringe";
import { InstanceModule , Instance , DeleteInstanceResponse, InstanceOpts , FindType, InstanceDoc, CountInstancesResponse, InstanceWithTimestamp } from "./types"

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
        
        const queryOpts : QueryConfig = {
            name : "add-instance",
            text : `INSERT INTO instances (socketId , userId , placeId , username , inventory) VALUES($1,$2,$3,$4,$5)`,
            values : [socketId.value , userId.value , placeId.value , username.value , JSON.stringify(inventory)]
        }    

        await this.pgClient!.query(queryOpts)
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

    private async find(data : InstanceOpts , type : FindType) : Promise<InstanceWithTimestamp | InstanceWithTimestamp[] | null> {
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
            name : "find-instance",
            text : queryText,
            values : Object.values(data).map((val) => Array.isArray(val) ? JSON.stringify(val.map) : val.value)
        }

        const query = await this.pgClient?.query(queryOpts)!

        if(query.rowCount >= 1) {
            const rows : InstanceDoc[] = query.rows

            if(type === "FindAll") {
                return Promise.resolve(rows.map(({ socketid , userid , placeid , username , inventory , timestamp }) : InstanceWithTimestamp => ({
                    socketId : new Uuid(socketid),
                    username : new Username(username),
                    userId : new Id(+userid),
                    placeId : new Id(+placeid),
                    timestamp : new Date(timestamp),
                    inventory
                })))
            }

            const { socketid , userid , placeid , username , inventory , timestamp } = rows[0]

            return Promise.resolve({
                socketId : new Uuid(socketid),
                username : new Username(username),
                userId : new Id(+userid),
                placeId : new Id(+placeid),
                timestamp : new Date(timestamp),
                inventory
            })
        }

        return Promise.resolve(null)
    }

    public async findOne(data : InstanceOpts) : Promise<InstanceWithTimestamp | null> {
        if(!this.pgClient) {
            await this.setPGClient()
        }

        return Promise.resolve(await this.find(data , "FindOne") as InstanceWithTimestamp | null)
    }

    public async findAll(data : InstanceOpts) : Promise<InstanceWithTimestamp[] | null> {
        if(!this.pgClient) {
            await this.setPGClient()
        }

        return Promise.resolve(await this.find(data , "FindAll") as InstanceWithTimestamp[] | null)
    }


    public async updateById(id : Uuid , opts : InstanceOpts) : Promise<boolean> {
        if(!this.pgClient) {
            await this.setPGClient()
        }

        const objectEntries = Object.entries(opts)

        if(objectEntries.length === 0) {
            return Promise.resolve(true)
        }

        const queryOpts : QueryConfig = {
            name : "update-instance",
            text : "UPDATE instances SET " +
            objectEntries.map((val, index) => `${val[0]}=$${index + 1}` + `${index + 1 !== objectEntries.length ? "," : ""}`).join("") +
            ` WHERE socketId=$${objectEntries.length + 1}`
            ,
            values : [...objectEntries.map((val) => (Array.isArray(val[1]) ? JSON.stringify(val[1]) : val[1].value)) , id.value]
        }

        const { rowCount } = await this.pgClient!.query(queryOpts)
        return Promise.resolve(rowCount >= 1)
    }

    public async getCount() : Promise<CountInstancesResponse> {
        if(!this.pgClient) {
            await this.setPGClient()
        }

        const queryOpts : QueryConfig = {
            name : "get-instance-count",
            text : "SELECT COUNT(*) FROM instances;"
        }

        const { rows } = await this.pgClient!.query(queryOpts)
        return Promise.resolve({
            count : +rows[0].count
        })
    }
}