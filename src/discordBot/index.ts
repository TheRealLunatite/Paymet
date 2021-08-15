import discordJs , { Client , ClientOptions } from "discord.js";
import { IFileLoader } from "@common/interfaces/IFileLoader";
import { autoInjectable, inject } from "tsyringe";
import { TOKENS } from "src/di";
import path from "path"
import { DiscordBotModule, DiscordConfig, DiscordSlashCommandsCollection , DiscordEventListenersCollection } from "./types";

@autoInjectable()
export class DiscordBot implements DiscordBotModule {
    private client : Client | null = null

    constructor(
        @inject(TOKENS.values.discordJsLib) private discordJsLib? : typeof discordJs,
        @inject(TOKENS.values.pathJoin) private pathJoin? : typeof path.join,
        @inject(TOKENS.discord.commandLoader) private discordCommandLoader? : IFileLoader<DiscordSlashCommandsCollection>,
        @inject(TOKENS.discord.eventLoader) private discordEventLoader? : IFileLoader<DiscordEventListenersCollection>
    ) {}

    async execute(config : DiscordConfig , clientOptions: ClientOptions): Promise<Client> {
        if(this.client) {
            throw new Error("PaymetDiscordBot : There's an instance of a Discord client that was already declared.")
        }
        
        this.client = new this.discordJsLib!.Client(clientOptions)

        // This property will be used inside the event listeners.
        this.client.slashCommands = await this.discordCommandLoader!.execute(this.pathJoin!(__dirname , config.commandPath))

        // Load each discord event listener.
        const eventListeners = await this.discordEventLoader!.execute(this.pathJoin!(__dirname , config.eventPath))
        eventListeners.mapValues((eventListener) => eventListener.execute(this.client!))

        await this.client.login(config.token)

        return Promise.resolve(this.client)
    }

}