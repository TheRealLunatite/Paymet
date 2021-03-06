import { DiscordId } from "@common/discordId"
import { Id } from "@common/id"

export interface CartModule {
    add(data : Cart) : Promise<Cart>,
    findOne(data : CartOpts) : Promise<Cart | null>,
    findAll(data : CartOpts) : Promise<Cart[] | null>,
    updateById(id : DiscordId , opts : CartOpts) : Promise<boolean>
}

export type Cart = {
    discordId : DiscordId,
    cart : CartItem[]
}

export interface CartItem {
    itemPlaceId : Id,
    itemRawName : string,
    itemType : string,
    itemRarity : string,
    itemQuantity : number
}

export type CartItemSanitize = {
    itemPlaceId : number,
    itemRawName : string,
    itemType : string,
    itemQuantity : number,
    itemRarity : string
}

export interface CartItemWithPrice extends CartItem {
    price : number
}

export type CartOpts = {
    discordId? : DiscordId,
    cart? : CartItem[]
}

export type CartDoc = {
    discordid : string,
    cart : CartItem[]
}

export type CountCartResponse = {
    count : number
}

export type FindType = "FindAll" | "FindOne"