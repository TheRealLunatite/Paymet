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
    createDeveloperProduct(cookie : Cookie , opts : CreateDevProductOpts) : Promise<CreateDevProductResponse | boolean>
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
    universeId : Id,
    name : string,
    priceInRobux : number,
    description : string,
    imageAssetId? : string
}

export type CreateDevProductResponse = {
    productId : Id
}