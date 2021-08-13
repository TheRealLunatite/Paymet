import { LoggerModule } from "@modules/logger/types";
import { Client } from "discord.js";
import { TOKENS } from "src/di";
import { autoInjectable, inject } from "tsyringe";
import { DiscordEventListener } from "../types";

@autoInjectable()
export class DiscordMessageCreateEvent implements DiscordEventListener {
    constructor(
        @inject(TOKENS.modules.logger) private logger? : LoggerModule
    ) {}

    execute(client: Client): void {
        // client.on("messageCreate" , async (message) => {
            
        // })
    }
}