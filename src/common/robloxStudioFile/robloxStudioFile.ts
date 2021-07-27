import { IReadFile } from "@common/interfaces/IReadFile";
import { IValidatePromise } from "@common/interfaces/IValidate";
import { IValueObject } from "@common/interfaces/IValueObject";

import fs from "fs"
import { extname } from "path"

export class RobloxStudioFile implements IValidatePromise , IValueObject<string> , IReadFile {
    value : string

    constructor(path : string) {
        this.value = path
        this.isValid().then((boolean) => {
            if(!boolean) {
                throw new RobloxFileNotValid("The file path does not exist or not a valid Roblox file.")
            }
        })
    }
    
    readFileStream(): fs.ReadStream {
        return fs.createReadStream(this.value)
    }

    isValid(): Promise<boolean> {
        return new Promise(async (resolve ,  reject) => {
            try {
                // cringe cause this doesn't return anything
                await fs.promises.access(this.value)
            } catch (e) {
                return resolve(false)
            }

            const fileExt = extname(this.value)

            if(fileExt !== ".rblx" && fileExt !== ".rbxlx") {
                return resolve(false)
            }

            return resolve(true)
        })
    }
}

export class RobloxFileNotValid extends Error {
    constructor(message : string) {
        super(message);

        this.name = this.constructor.name;
        this.stack = new Error().stack;
    }
}