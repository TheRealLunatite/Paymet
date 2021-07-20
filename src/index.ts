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
import { InventoryDBModule } from "@modules/inventory"

const app = container.resolve<typeof application>(TOKENS.values.expressApp)
app.use(express.json())
const wsServer = container.resolve<WebSocketServerModule>(TOKENS.modules.websocketServer)

const robloxComponent = container.resolve<RobloxExpressComponent>(TOKENS.components.roblox.component)
robloxComponent.execute()

const authComponent = container.resolve<AuthExpressComponent>(TOKENS.components.auth.component)
authComponent.execute()

const inventoryDB = container.resolve<InventoryDBModule>(TOKENS.modules.inventoryDB)

async function test() {
    await wsServer.start({ port : 8080 })
    app.listen(3000 , () => console.log('yep'))

    const result = await inventoryDB.deleteById(new Uuid("608327c0-2267-4977-bc35-5aa325384fa2"))

    console.log(result)
}

test()


// app.listen(3000 , () => console.log('Live on PORT 3000'))

// id uuid NOT NULL