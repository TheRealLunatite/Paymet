import { application } from "express"
import { TOKENS } from "./di"
import { container } from "tsyringe"
import { RobloxExpressComponent } from "@components/roblox/express"
import { TransactionDBModule } from "@modules/transaction"
import { Uuid } from "@common/uuid"
import { v4} from "uuid"
import { DiscordId } from "@common/discordId"
import { Username } from "@common/username"
import { Id } from "@common/id"

const app = container.resolve<typeof application>(TOKENS.values.expressApp)

const component = container.resolve<RobloxExpressComponent>(TOKENS.components.roblox.component)
component.execute()

const transactionDB = container.resolve<TransactionDBModule>(TOKENS.modules.transactionDb)

async function test() {
}

test()

// app.listen(3000 , () => console.log('Live on PORT 3000'))

// id uuid NOT NULL