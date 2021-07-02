import { NewUniverseInfo, IRobloxModule, RobloxUserSettings, ConfigureUniverseOpts } from "./types";
import { TOKENS } from "src/di";
import { injectable , inject } from "tsyringe";
import { RequestModule, RequestOptions, RequestResponse } from "@modules/request/types";
import { Cookie } from "@common/cookie";
import { RobloxStudioFile } from "@common/robloxStudioFile";
import { Id } from "@common/id";

@injectable()
export class RobloxModule implements IRobloxModule {
    constructor(@inject(TOKENS.modules.request) private requestModule : RequestModule) {}

    private async requestWithCookie<T>(cookie : Cookie , requestOptions : RequestOptions) : Promise<RequestResponse<T>> {
        const responseSchema = await this.requestModule.request<T>({
            url : requestOptions.url,
            method : requestOptions.method,
            headers : {
                "User-Agent" : "RobloxStudio/WinInet RobloxApp/0.484.0.425477 (GlobalDist; RobloxDirectDownload)", // Roblox Studio User-Agent XD
                "Cookie" : `.ROBLOSECURITY=${cookie.value}`,
                ...requestOptions.headers
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
                "X-CSRF-TOKEN" : await this.getXsrfToken(cookie),
                ...requestOptions.headers
            },
            body : requestOptions.body
        })

        return Promise.resolve(responseSchema)
    }

    public async getUserSettings(cookie : Cookie) : Promise<RobloxUserSettings> {
        const { data } = await this.requestWithCookie<RobloxUserSettings>(cookie , { 
            url : "https://www.roblox.com/my/settings/json",
            method : "GET"
        })

        return Promise.resolve(data)
    }

    public async createUniverse(cookie : Cookie , templateId : number) : Promise<NewUniverseInfo> {
        const { data } = await this.requestWithCookieAndToken<NewUniverseInfo>(cookie , {
            url : "https://api.roblox.com/universes/create",
            method : "POST",
            body : {
                templatePlaceIdToUse : templateId
            }
        })

        return Promise.resolve(data)
    }

    public async overwriteUniverse(cookie : Cookie , file : RobloxStudioFile , rootPlaceId : Id) : Promise<boolean> {
        const overwriteUniverseResponse = await this.requestWithCookieAndToken<number>(cookie , {
            url : `https://data.roblox.com/Data/Upload.ashx?assetid=${rootPlaceId}&issavedversiononly=false`,
            body : file.readFileStream(),
            method : "POST"
        })

        // The following ROBLOX endpoint returns the given rootPlaceId if successful.
        return Promise.resolve(rootPlaceId.equal(new Id(overwriteUniverseResponse.data)))
    }

    public async configureUniverse(cookie : Cookie , placeId : Id , opts : ConfigureUniverseOpts) {
        // don't wanna write the types for the response XD
        await this.requestWithCookieAndToken<unknown>(cookie , {
            url : `https://develop.roblox.com/v1/places/${placeId.value}`,
            method : "PATCH",
            body : opts
        })

        return Promise.resolve(true)
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