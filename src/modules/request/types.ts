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
    },
    body? : {
        [name : string] : unknown
    },
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