import { Cookie } from "@common/cookie";
import { Id } from "@common/id";
import { Uuid } from "@common/uuid";
import { CommandInteraction } from "discord.js";

export type LoadPurchasePrompt = {
    interaction : CommandInteraction,
    cookie : Cookie,
    userId : Id,
    assetId : Id,
    expiresInSeconds? : number
}

export type PurchasePromptResponse = {
    success : boolean,
    reason : string
}

export type InventoryData = {
    socketId : Uuid,
    userId : Id,
    inventory : InventoryItem[]
}