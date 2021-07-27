import fs from "fs"

export interface IReadFile {
    readFileStream() : fs.ReadStream
}