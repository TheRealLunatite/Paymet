import { AxiosInstance, AxiosRequestConfig , Method , ResponseType } from "axios"
import { RequestModule, RequestOptions, RequestResponse } from "./types"
import { inject, injectable } from "tsyringe"
import { TOKENS } from "src/di"

@injectable()
export class AxiosModule implements RequestModule {
    constructor(@inject(TOKENS.values.axiosInstance) private _instance : AxiosInstance) {}

    public async request(options: RequestOptions): Promise<RequestResponse> {
        const { status , data , headers } = await this._instance.request(this.convertReqOptsToAxiosOpts(options))

        return Promise.resolve({
            status,
            data,
            headers
        })
    }

    private convertReqOptsToAxiosOpts(options : RequestOptions) : AxiosRequestConfig {
        return {
            url : options.url,
            method : options.method as Method,
            headers : options.headers,
            baseURL : options.baseURL,
            timeout : options.timeout,
            responseType : options.responseType as ResponseType,
            params : options.params,
            data : options.body
        }
    }
}  

