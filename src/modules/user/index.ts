import { IPostgresModule } from "@modules/postgres/types"
import { TOKENS } from "src/di";
import { inject, injectable } from "tsyringe";
import { Client, ConnectionConfig, QueryConfig } from   "pg"
import { UserModule, User, UserDoc, UserDocOptional, UserPrimitiveDoc } from "./types";
import { Id } from "@common/id";
import { Username } from "@common/username";
import { Password } from "@common/password";
import { v4 as uuid } from "uuid";

@injectable()
export class UserDBModule implements UserModule {
    private pgClient : Client | null = null
    
    constructor(
        @inject(TOKENS.modules.postgres) private postgres : IPostgresModule,
        @inject(TOKENS.values.postgresConfig) private pgConnectionConfig : ConnectionConfig,
        @inject(TOKENS.values.uuid) private v4 : typeof uuid
    ) {}

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
            text : `INSERT INTO paymetUsers (username , password) VALUES ($1,$2) RETURNING id,timestamp;`,
            values : [username.value , password.value]
        }   

        const { rows } = await this.pgClient?.query(query)!

        return Promise.resolve({
            id : new Id(+rows[0].id),
            username : username,
            password : password,
            registerDate : new Date(rows[0].timestamp)
        })
    }

    public async deleteById(id : Id) {
        if(!this.pgClient) {
            await this.setPGClient()
        }

        const query : QueryConfig = {
            name : "delete-user-by-id",
            text : "DELETE FROM paymetUsers WHERE id = $1",
            values : [id.value]
        }

        const result = await this.pgClient?.query(query)
        return Promise.resolve(result?.rowCount! >= 1)
    }

    public async findOne(doc : UserDocOptional) : Promise<UserDoc | null> {
        if(!this.pgClient) {
            await this.setPGClient()
        }   

        const objectKeys = Object.keys(doc)
        const queryText = "SELECT * FROM paymetUsers WHERE " + (objectKeys.length === 0 ? "1 = 1;" : objectKeys.map((key , index) => `${key} = $${index + 1}` + (index + 1 === objectKeys.length ? "" : " AND ")).join("") + " LIMIT 1;")
        
        const query : QueryConfig = {
            name : "find-paymetUser",
            text : queryText,
            values : Object.values(doc).map((val) => val.value)
        }

        const { rows , rowCount } = await this.pgClient?.query(query)!

        if(rowCount >= 1) {
            const { id , username , password , timestamp }: UserPrimitiveDoc = rows[0]
            return {
                id : new Id(+id),
                username : new Username(username),
                password : new Password(password),
                registerDate : new Date(timestamp) 
            }
        }

        return Promise.resolve(null)
    }

    public async findAll(doc : UserDocOptional) : Promise<UserDoc[] | null> {
        if(!this.pgClient) {
            await this.setPGClient()
        }   

        const objectKeys = Object.keys(doc)
        const queryText = "SELECT * FROM paymetUsers WHERE " + (objectKeys.length === 0 ? "1 = 1 LIMIT 100;" : objectKeys.map((key , index) => `${key} = $${index + 1}` + (index + 1 === objectKeys.length ? ";" : " AND ")).join(""))

        const query : QueryConfig = {
            name : "find-paymetUser",
            text : queryText,
            values : Object.values(doc).map((val) => val.value)
        }

        const { rows , rowCount } = await this.pgClient?.query(query)!
        const docs : UserPrimitiveDoc[] = rows

        if(rowCount >= 1) {
            return Promise.resolve(docs.map(({id, username , password , timestamp}) => ({
                id : new Id(+id),
                username : new Username(username),
                password : new Password(password),
                registerDate : new Date(timestamp)
            })))
        }

        return Promise.resolve(null)
    }
}