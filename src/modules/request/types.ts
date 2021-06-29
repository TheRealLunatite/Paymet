export interface RequestModule {
    request(options : RequestOptions) : Promise<RequestResponse>
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

export type RequestResponse = {
    status : number,
    data : {
        [name : string] : unknown
    },
    headers : {
        [name : string] : string
    }
}