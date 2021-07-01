import fs from "fs"

export interface RequestModule {
    request<T>(options : RequestOptions) : Promise<RequestResponse<T>>
}

export type RequestOptions = {
    url? : string,
    method? : string,
    baseURL? : string,
    timeout? : number,
    responseType? : string,
    params? : {
        [name : string] : string,
    } | URLSearchParams ,
    body? : {
        [name : string] : unknown
    } | string | Buffer | fs.ReadStream, 
    headers? : {
        [name : string] : unknown
    }
}

export type RequestResponse<T> = {
    status : number,
    data : T,
    headers : {
        [name : string] : string
    }
}