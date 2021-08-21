import fs , { PathLike } from "fs";
import { Collection } from "discord.js";
import { IFileLoader } from "@common/interfaces/IFileLoader";
import { DiscordSlashCommandsCollection , SlashCommand } from "../types";
import { autoInjectable, inject } from "tsyringe";
import { TOKENS } from "src/di";

@autoInjectable()
export class DiscordCommandLoader implements IFileLoader<DiscordSlashCommandsCollection> {
    private _cache : DiscordSlashCommandsCollection = new Collection()

    constructor(
        @inject(TOKENS.values.fsLib) private fsLib? : typeof fs
    ) {}

    async execute(path: PathLike) : Promise<DiscordSlashCommandsCollection> {
        if(this._cache.size >= 1) {
            return Promise.resolve(this._cache)
        }

        const isPathDirectory = await (await this.fsLib!.promises.lstat(path)).isDirectory()

        if(!isPathDirectory) {
            throw new DiscordCommandLoaderError(`${path} is not a directory.`)
        }

        const commandDir = await this.fsLib!.promises.readdir(path)
        
        // Filter out all non-directories in the directory path.
        const directories = commandDir.filter((file) => fs.lstatSync(path + file).isDirectory())

        directories.forEach(async (directory) => {
            const slashCommand = Object.values(require(path + directory))[0] as any
            const slashCommandInstance = new slashCommand() as SlashCommand
            this._cache.set(slashCommandInstance.name , slashCommandInstance)
        })

        return Promise.resolve(this._cache)
    }
}

export class DiscordCommandLoaderError extends Error {
    constructor(message : string) {
        super(message);

        this.name = this.constructor.name;
        this.stack = new Error().stack;
    }
}