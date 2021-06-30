import { Cookie } from "@common/cookie";

export interface IRobloxModule {
    getUserSettings(cookie : Cookie) : Promise<RobloxUserSettings>
}

export type RobloxUserSettings = {
    Name : string,
    UserId : number,
    isPremium : boolean
}

export type NewUniverseInfo = {
    UniverseId : number,
    RootPlaceId : number
}