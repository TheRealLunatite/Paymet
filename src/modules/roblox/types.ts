import { Cookie } from "@common/cookie";
import { Id } from "@common/id";
import { RobloxStudioFile } from "@common/robloxStudioFile";
import { templateId } from "@common/templateId"


export interface IRobloxModule {
    isUserAuthenticated(cookie : Cookie) : Promise<boolean>,
    getUserSettings(cookie : Cookie) : Promise<RobloxUserSettings>
    createUniverse(cookie : Cookie , templateId : templateId) : Promise<NewUniverse>,
    overwriteUniverse(cookie : Cookie , file : RobloxStudioFile , rootPlaceId : Id) : Promise<boolean>,
    configureUniverse(cookie : Cookie , placeId : Id , opts : ConfigureUniverseOpts) : Promise<boolean>,
    getXsrfToken(cookie : Cookie) : Promise<string | null>,
    createDeveloperProduct(cookie : Cookie , opts : CreateDevProductOpts) : Promise<Id | null>,
    getDeveloperProducts(placeId : Id , pageNum : number) : Promise<GetDeveloperProducts>,
    getAllDeveloperProducts(placeId : Id) : Promise<DeveloperProduct[]>,
    getUniverseId(cookie : Cookie , placeId : Id) : Promise<null | number>
}

export type AuthenticatedUser = {
    id : number,
    name : string,
    displayName : string
}

export type RobloxUserSettings = {
    Name : string,
    UserId : number,
    isPremium : boolean
}

export type NewUniverse = {
    UniverseId : number,
    RootPlaceId : number
}

export type ConfigureUniverseOpts = {
    name? : string,
    description? : string,
}

export type CreateDevProductOpts = {
    placeId : Id,
    name : string,
    priceInRobux : number,
    description? : string,
    imageAssetId? : string
}

export type CreateDevProductResponse = {
    productId : Id
}

export type GetDeveloperProducts = {
    DeveloperProducts : DeveloperProduct[],
    FinalPage : boolean,
    PageSize : 50
}

export type DeveloperProduct = {
    ProductId : number,
    DeveloperProductId : number,
    Name : string,
    Description : string,
    IconImageAssetId : null | number,
    displayName : string,
    displayDescription : null | string,
    displayIcon : null | number,
    PriceInRobux : null | number
}

export type PlaceDetail = {
    placeId : number,
    name : string,
    description : string,
    url : string,
    builder : string,
    builderId : number,
    isPlayable : boolean,
    reasonProhibited : string,
    universeId : number,
    universeRootPlaceId : number,
    price : number,
    imageToken : string
}