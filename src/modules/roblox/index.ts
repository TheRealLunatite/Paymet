import { NewUniverse, IRobloxModule, RobloxUserSettings, ConfigureUniverseOpts, AuthenticatedUser, CreateDevProductOpts, CreateDevProductResponse, DeveloperProduct, GetDeveloperProducts, PlaceDetail , UserInventoryResponse } from "./types";
import { TOKENS } from "src/di";
import { injectable , inject } from "tsyringe";
import { RequestModule, RequestOptions, RequestResponse } from "@modules/request/types";
import { Cookie } from "@common/cookie";
import { RobloxStudioFile } from "@common/robloxStudioFile";
import { templateId } from "@common/templateId"
import { Id } from "@common/id";

@injectable()
export class RobloxModule implements IRobloxModule {
    constructor(@inject(TOKENS.modules.request) private requestModule : RequestModule) {}

    private async request<T>(requestOptions : RequestOptions) : Promise<RequestResponse<T>> {
        const responseSchema = await this.requestModule.request<T>({
            url : requestOptions.url,
            method : requestOptions.method,
            headers : {
                "User-Agent" : "RobloxStudio/WinInet RobloxApp/0.484.0.425477 (GlobalDist; RobloxDirectDownload)",
                ...requestOptions.headers
            },
            body : requestOptions.body
        })

        return Promise.resolve(responseSchema)
    }

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

    public async isUserAuthenticated(cookie : Cookie) : Promise<boolean> {
        try {
            await this.requestWithCookie<AuthenticatedUser>(cookie , {
                url : "https://users.roblox.com/v1/users/authenticated",
                method : "GET"
            })
    
            return Promise.resolve(true)
        } catch {
            return Promise.resolve(false)
        }
    }

    public async getUserSettings(cookie : Cookie) : Promise<RobloxUserSettings> {
        const { data } = await this.requestWithCookie<RobloxUserSettings>(cookie , { 
            url : "https://www.roblox.com/my/settings/json",
            method : "GET"
        })

        return Promise.resolve(data)
    }

    public async createUniverse(cookie : Cookie , templateId : templateId) : Promise<NewUniverse> {
        const { data } = await this.requestWithCookieAndToken<NewUniverse>(cookie , {
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
            url : `https://data.roblox.com/Data/Upload.ashx?assetid=${rootPlaceId.value}&issavedversiononly=false`,
            body : file.readFileStream(),
            method : "POST"
        })

        // The following ROBLOX endpoint returns the given rootPlace    d if successful.
        return Promise.resolve(rootPlaceId.equal(new Id(overwriteUniverseResponse.data)))
    }

    public async configureUniverse(cookie : Cookie , placeId : Id , opts : ConfigureUniverseOpts) : Promise<boolean> {
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

    public async createDeveloperProduct(cookie : Cookie , opts : CreateDevProductOpts) : Promise<null | Id> {
        const universeId = await this.getUniverseId(cookie , opts.placeId)
        const response = await this.requestWithCookieAndToken<string>(cookie , {
            url : "https://www.roblox.com/places/developerproducts/add",
            method : "POST",
            body : {
                universeId : universeId,
                name : opts.name,
                priceInRobux : opts.priceInRobux,
                description : opts.description || "",
                imageAssetId : opts.imageAssetId || ""
            }
        })

        const findProductId = /Product ([0-9]*)/m.exec(response.data)

        if(!findProductId) {
            return Promise.resolve(null)
        }

        if(findProductId[1] === "0") {
            return Promise.resolve(null)
        }

        return Promise.resolve(new Id(+findProductId[1]))
    }

    public async getUniverseId(cookie : Cookie , placeId : Id) : Promise<number | null> {
        const response = await this.requestWithCookieAndToken<PlaceDetail[]>(cookie , {
            url : `https://games.roblox.com/v1/games/multiget-place-details?placeIds=${placeId.value}`,
            method : "GET"
        })

        if(response.data.length === 0) {
            return Promise.resolve(null)
        }

        return Promise.resolve(response.data[0].universeId)
    }

    private async getDeveloperProducts(placeId : Id , pageNum : number) : Promise<GetDeveloperProducts> {
        const response = await this.request<GetDeveloperProducts>({
            url : `http://api.roblox.com/developerproducts/list?placeid=${placeId.value}&page=${pageNum}`,
            method : "GET"
        })

        return Promise.resolve(response.data)
    }

    public async playerOwnsAsset(cookie : Cookie , playerId : Id , assetId : Id) : Promise<boolean> {
        try {
            const response = await this.requestWithCookie<UserInventoryResponse>(cookie , {
                url : `https://inventory.roblox.com/v1/users/${playerId.value}/items/Asset/${assetId.value}`,
                method : "GET"
            })

            return response.data.data.length >= 1 ? true : false
        } catch {
            return false
        }
    }

    public async getAllDeveloperProducts(placeId : Id) : Promise<DeveloperProduct[]>{
        const recursiveFunc = async (data : DeveloperProduct[] , pageNum : number) : Promise<DeveloperProduct[]> => {
            const response = await this.getDeveloperProducts(placeId , pageNum)
            const newData = [...data , ...response.DeveloperProducts]

            if((response.DeveloperProducts.length <= 0) || (response.FinalPage)) {
                return newData
            }

            return await recursiveFunc(newData , pageNum + 1)
        }

        const allDeveloperProducts : DeveloperProduct[] = await recursiveFunc([] , 1)
        return Promise.resolve(allDeveloperProducts)
    }
}