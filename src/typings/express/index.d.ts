type InventoryItem = {
    itemName : string,
    itemRawName: string,
    itemRarity : string,
    itemType : string,
    itemImage : string,
    itemStock : number
}

declare module Express {
    interface Request {
        inventory? : Array<InventoryItem>,
        user? : any,
        totalPriceInRobux? : number
    }

    interface Response {
    }
}