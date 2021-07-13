import { PostgresModule } from "@modules/postgres/pg";
import { TOKENS } from "src/di";
import { inject, injectable } from "tsyringe";
import { Client, ConnectionConfig, QueryConfig } from   "pg"
import { IUserDBModule, User, UserDoc } from "./types";
import { Id } from "@common/id";

@injectable()
export class UserDBModule implements IUserDBModule {
    private pgClient : Client | null = null
    
    constructor(@inject(TOKENS.modules.postgres) private postgres : PostgresModule, @inject(TOKENS.values.transactionDbConfig) private pgConnectionConfig : ConnectionConfig) {}

    private async setPGClient() {
        this.pgClient = await this.postgres.getPGClient(this.pgConnectionConfig)
    }

    public async add(user : User) : Promise<UserDoc> {
        if(!this.pgClient) {
            await this.setPGClient()
        }

        const { username , password } = user

        const query : QueryConfig = {
            name : "add-user",
            text : `INSERT INTO paymetUsers (username , password) VALUES ($1,$2) RETURNING id;`,
            values : [username.value , password.value]
        }   

        const result = await this.pgClient?.query(query)
        
        return Promise.resolve({
            id : new Id(+result?.rows[0].id),
            username : username,
            password : password
        })
    }
}