import { NewUniverseInfo, IRobloxModule, RobloxUserSettings } from "./types";
import { TOKENS } from "src/di";
import { injectable , inject } from "tsyringe";
import { RequestModule, RequestOptions, RequestResponse } from "@modules/request/types";
import { Cookie } from "@common/cookie";

@injectable()
export class RobloxModule implements IRobloxModule {
    constructor(@inject(TOKENS.modules.request) private requestModule : RequestModule) {}

    private async requestWithCookie<T>(cookie : Cookie , requestOptions : RequestOptions) : Promise<RequestResponse<T>> {
        const responseSchema = await this.requestModule.request<T>({
            url : requestOptions.url,
            method : requestOptions.method,
            headers : {
                "User-Agent" : "RobloxStudio/WinInet RobloxApp/0.484.0.425477 (GlobalDist; RobloxDirectDownload)", // Roblox Studio User-Agent XD
                "Cookie" : `.ROBLOSECURITY=${cookie.value}`
            },
            body : requestOptions.body
        })

        return Promise.resolve(responseSchema)
    }

    private async requestWithCookieAndToken<T>(cookie : Cookie , requestOptions : RequestOptions) : Promise<RequestResponse<T>> {
        const responseSchema = await this.requestModule.request<T>({
            url : requestOptions.url,
            method : requestOptions.method,
            headers : {
                "User-Agent" : "RobloxStudio/WinInet RobloxApp/0.484.0.425477 (GlobalDist; RobloxDirectDownload)", // Roblox Studio User-Agent XD
                "Cookie" : `.ROBLOSECURITY=${cookie.value}`,
                "X-CSRF-TOKEN" : await this.getXsrfToken(cookie)
            },
            body : requestOptions.body
        })

        return Promise.resolve(responseSchema)
    }

    public async getUserSettings(cookie : Cookie) : Promise<RobloxUserSettings> {
        const getUserSettingsResponse = await this.requestWithCookie<RobloxUserSettings>(cookie , { 
            url : "https://www.roblox.com/my/settings/json",
            method : "GET"
        })

        return Promise.resolve(getUserSettingsResponse.data)
    }

    // add the default roblox templates
    public async createUniverse(cookie : Cookie , templateId : number) : Promise<NewUniverseInfo> {
        const createPlaceResponse = await this.requestWithCookieAndToken<NewUniverseInfo>(cookie , {
            url : "https://api.roblox.com/universes/create",
            method : "POST",
            body : {
                templatePlaceIdToUse : templateId
            }
        })

        return Promise.resolve(createPlaceResponse.data)
    }

    public async overwriteUniverse() {
        /*
            Content-Type : application/octet-stream
            Roblox-Place-Id : Roblox-Place-Id: 7020109056
            Requester : Client
            PlayerCount : 0

            Upload rbxl file?
        */
    }

    public async getXsrfToken(cookie : Cookie) : Promise<string | null> {
        try {
            await this.requestWithCookie<string>(cookie , {
                url : "https://auth.roblox.com",
                method : "POST"
            })

            return Promise.resolve(null)
        } catch (e) {
            return Promise.resolve(e.response.headers['x-csrf-token'])
        }
    }
}