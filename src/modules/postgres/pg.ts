import pg , { ConnectionConfig , Client } from "pg";
import { TOKENS } from "src/di";
import { inject , singleton } from "tsyringe";
import { IPostgresModule, PostgresOptionsNotValid } from "./types";

@singleton()
export class PostgresModule implements IPostgresModule {
    private pgClient : Client | null = null

    constructor(@inject(TOKENS.values.postgresLib) private postgres : typeof pg) {}   

    private async connect(connectionOptions :  ConnectionConfig) {
        this.pgClient = new this.postgres.Client(connectionOptions)
        await this.pgClient.connect()
    }

    public async getPGClient(connectionOptions? : ConnectionConfig) : Promise<Client> { 
        if(this.pgClient === null) {
            if(!connectionOptions) {
                throw new PostgresOptionsNotValid("Unable to connect to the client due to 'connectOptions' missing arg.")
            }

            await this.connect(connectionOptions)
        }

        return Promise.resolve(this.pgClient!)
    }
}   