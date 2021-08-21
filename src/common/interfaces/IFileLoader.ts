import { PathLike } from "fs";

export interface IFileLoader<T> {
    execute(path : PathLike) : Promise<T>
} 