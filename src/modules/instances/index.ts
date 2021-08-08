import { IPostgresModule } from "@modules/postgres/types";
import { Client , ConnectionConfig, QueryConfig } from "pg";
import { TOKENS } from "src/di";
import { singleton , inject } from "tsyringe";
import { InstanceModule , Instance } from "./types"

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
        
        console.log(JSON.stringify(inventory))

        // Validate the inventory data before adding the data in.
        const query : QueryConfig = {
            name : "add-instance",
            text : `INSERT INTO instances (socketId , userId , placeId , username , inventory) VALUES($1,$2,$3,$4,$5)`,
            values : [socketId.value , userId.value , placeId.value , username.value , JSON.stringify(inventory)]
        }    

        await this.pgClient!.query(query)

        return Promise.resolve(data)
    }
}