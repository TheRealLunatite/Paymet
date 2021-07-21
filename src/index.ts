import { application } from "express"
import { TOKENS } from "./di"
import { container } from "tsyringe"
import { RobloxExpressComponent } from "@components/roblox/express"
import { Uuid } from "@common/uuid"
import { v4 } from "uuid"
import { DiscordId } from "@common/discordId"
import { Username } from "@common/username"
import { Id } from "@common/id"
import { WebSocketServerModule } from "@modules/websocketServer"
import { AuthExpressComponent } from "@components/auth/express"
import express from "express"
import path from "path"
import { InventoryDBModule } from "@modules/inventory"

const app = container.resolve<typeof application>(TOKENS.values.expressApp)
app.use(express.json())
const wsServer = container.resolve<WebSocketServerModule>(TOKENS.modules.websocketServer)

const robloxComponent = container.resolve<RobloxExpressComponent>(TOKENS.components.roblox.component)
robloxComponent.execute()

const authComponent = container.resolve<AuthExpressComponent>(TOKENS.components.auth.component)
authComponent.execute()

const inventoryDB = container.resolve<InventoryDBModule>(TOKENS.modules.inventoryDb)

async function test() {
    await wsServer.listen({ port : 8080 })
    console.log('Websocket listening on port 8080.')
    app.listen(3000 , () => console.log('Express server listening on Port : 3000.'))

    try {
        await inventoryDB.add({
            socketId : new Uuid(v4()),
            robloxUser : new Username("Hello"),
            placeId : new Id(1123),
            userId : new Id(123),
            inventory : [
                {
                    itemImage: 'http://www.roblox.com/Thumbs/Asset.ashx?format=png&width=250&height=250&assetId=5872999805',
                    itemStock: 1,
                    itemType: 'Floating',
                    itemName: 'Scarecrow',
                    itemRarity: 'Rare'
                },
                {
                    itemImage: 'http://www.roblox.com/Thumbs/Asset.ashx?format=png&width=250&height=250&assetId=582999805',
                    itemStock: 11,
                    itemType: '312',
                    itemName: '3123',
                    itemRarity: '12312313'
                }
            ]
        })
    } catch (e) {
        console.error(e)
    }
}

test()


// app.listen(3000 , () => console.log('Live on PORT 3000'))

// id uuid NOT NULL