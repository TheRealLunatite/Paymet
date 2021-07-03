import { Client, ConnectionConfig } from "pg";

export class PostgresOptionsNotValid extends Error {
    constructor(message : string) {
        super(message);

        this.name = this.constructor.name;
        this.stack = new Error().stack;
    }
}

export interface IPostgresModule {
    getPGClient(connectionOptions? : ConnectionConfig) : Promise<Client>
}