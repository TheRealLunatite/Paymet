import fs , { PathLike } from "fs"
import { IFileLoader } from "@common/interfaces/IFileLoader"
import { Collection } from "discord.js"
import { autoInjectable, inject } from "tsyringe"
import { DiscordEventListener, DiscordEventListenersCollection } from "./types"
import { TOKENS } from "src/di"

@autoInjectable()
export class DiscordEventLoader implements IFileLoader<DiscordEventListenersCollection> {
    private _cache : DiscordEventListenersCollection = new Collection()

    constructor(
        @inject(TOKENS.values.fsLib) private fsLib? : typeof fs
    ) {}

    async execute(path: PathLike) : Promise<DiscordEventListenersCollection> {
        if(this._cache.size >= 1) {
            return Promise.resolve(this._cache)
        }

        const isPathDirectory = await (await this.fsLib!.promises.lstat(path)).isDirectory()

        if(!isPathDirectory) {
            throw new DiscordEventLoaderError(`${path} is not a directory.`)
        }

        const commandDir = await this.fsLib!.promises.readdir(path)
        
        // Filter out all non-directories in the directory path.
        const directories = commandDir.filter((file) => fs.lstatSync(path + file).isDirectory())

        directories.forEach(async (directory) => {
            const discordEventListener = Object.values(require(path + directory))[0] as any
            const discordEventListenerInstance = new discordEventListener() as DiscordEventListener
            this._cache.set(this._cache.size , discordEventListenerInstance)
        })

        return Promise.resolve(this._cache)
    }
}

export class DiscordEventLoaderError extends Error {
    constructor(message : string) {
        super(message);

        this.name = this.constructor.name;
        this.stack = new Error().stack;
    }
}