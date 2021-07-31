import { Uuid } from "@common/uuid"

export interface PriceModule {
    add(item : Item) : Promise<boolean>,
    findOne(opts : ItemOptional) : Promise<null | Item>,
    updateById(id : Uuid , opts : ItemOptional) : Promise<boolean>,
    deleteById(id : Uuid) : Promise<boolean>
}

export type Item = {
    id : Uuid,
    name : string,
    price : number
}

export type ItemOptional = {
    id? : Uuid,
    name? : string,
    price? : number
}

export type ItemDoc = {
    id : string,
    name : string,
    price : number
}