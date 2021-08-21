import { Uuid } from "@common/uuid"
import { Id } from "@common/id"

export interface PriceModule {
    add(item : Item) : Promise<boolean>,
    findOne(opts : ItemOptional) : Promise<null | Item>,
    findAll(opts : ItemOptional) : Promise<null | Item[]>
    updateById(id : Uuid , opts : ItemOptional) : Promise<boolean>,
    deleteById(id : Uuid) : Promise<boolean>
}

export type Item = {
    id : Uuid,
    itemPlaceId : Id,
    itemName : string,
    priceInRobux : number
}

export type ItemOptional = {
    id? : Uuid,
    itemPlaceId? : Id,
    itemName? : string,
    priceInRobux? : number
}

export type ItemDoc = {
    id : string,
    itemname : string,
    itemplaceid : string,
    priceinrobux : string
}

export type FindType = "FindAll" | "FindOne"