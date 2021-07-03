import { application } from "express"
import { TOKENS } from "./di"
import { container } from "tsyringe"
import { RobloxExpressComponent } from "@components/roblox/express"
import { PostgresModule } from "@modules/postgres/pg"
import appConfig from "@config/"

const app = container.resolve<typeof application>(TOKENS.values.expressApp)

const component = container.resolve<RobloxExpressComponent>(TOKENS.components.roblox.component)
component.execute()

const postgres = container.resolve<PostgresModule>(TOKENS.modules.postgres)

async function test() {
    const client = await postgres.getPGClient({
        host : appConfig.postgres.host,
        port : parseInt(appConfig.postgres.port),
        user : appConfig.postgres.user,
        password : appConfig.postgres.password,
        database : appConfig.postgres.database
    })

    console.log(client)

}

test()

// app.listen(3000 , () => console.log('Live on PORT 3000'))