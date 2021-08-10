import discordJs , { Client , ClientOptions , Intents } from "discord.js";
import { autoInjectable, inject } from "tsyringe";
import { TOKENS } from "src/di";
import { DiscordBotModule, DiscordConfig } from "./types";
import { DiscordEventListener } from "./events/types";

@autoInjectable()
export class DiscordBot implements DiscordBotModule {
    private client : Client | null = null
    
    constructor(
        @inject(TOKENS.values.discordJsLib) private discordJsLib? : typeof discordJs,
        @inject(TOKENS.discord.commands) private discordSlashCommands? : Client['slashCommands'],
        @inject(TOKENS.discord.listeners) private discordEventListeners? : DiscordEventListener[]
    ) {}

    async execute(config : DiscordConfig , clientOptions: ClientOptions): Promise<Client> {
        if(this.client) {
            throw new Error("PaymetDiscordBot : There's an instance of a Discord client that was already declared.")
        }
        
        this.client = new this.discordJsLib!.Client(clientOptions)

        // This property will be used inside the event listeners.
        this.client.slashCommands = this.discordSlashCommands!

        // Load each discord event listener.
        this.discordEventListeners!.forEach((event) => event.execute(this.client!))
        
        await this.client.login(config.token)
        
        return Promise.resolve(this.client)
    }

}