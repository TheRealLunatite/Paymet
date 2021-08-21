export type ItemTraded = {
    itemRawName : string,
    itemType : string,
    itemRarity : string,
    itemPlaceId : string,
}

export type AcceptedTradeData = {
    transactionId : string,
    type : string,
    items : ItemTraded[]
}