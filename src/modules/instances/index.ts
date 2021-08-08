import { Uuid } from "@common/uuid";
import { IPostgresModule } from "@modules/postgres/types";
import { Client , ConnectionConfig, QueryConfig } from "pg";
import { TOKENS } from "src/di";
import { singleton , inject } from "tsyringe";
import { InstanceModule , Instance , DeleteInstanceResponse } from "./types"

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
}