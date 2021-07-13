import { generateKeyPairSync , publicEncrypt , privateDecrypt } from "crypto"
import { application } from "express"
import { TOKENS } from "./di"
import { container } from "tsyringe"
import { RobloxExpressComponent } from "@components/roblox/express"
import { TransactionDBModule } from "@modules/transaction"
import { Uuid } from "@common/uuid"
import { v4 } from "uuid"
import { DiscordId } from "@common/discordId"
import { Username } from "@common/username"
import { Id } from "@common/id"
import { WebSocketServerModule } from "@modules/websocketServer"
import { AuthExpressComponent } from "@components/auth/express"

const app = container.resolve<typeof application>(TOKENS.values.expressApp)
const wsServer = container.resolve<WebSocketServerModule>(TOKENS.modules.websocketServer)

const robloxComponent = container.resolve<RobloxExpressComponent>(TOKENS.components.roblox.component)
robloxComponent.execute()

const authComponent = container.resolve<AuthExpressComponent>(TOKENS.components.auth.component)
authComponent.execute()


const transactionDB = container.resolve<TransactionDBModule>(TOKENS.modules.transactionDb)

async function test() {
    await wsServer.start({ port : 8080 })
    app.listen(3000 , () => console.log('yep'))
}

test()


// app.listen(3000 , () => console.log('Live on PORT 3000'))

// id uuid NOT NULL