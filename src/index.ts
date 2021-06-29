import { application } from "express"
import { TOKENS } from "./di"
import { container } from "tsyringe"
import { AxiosModule } from "@modules/request/axios"
import { RobloxExpressComponent } from "@components/roblox/express"

const app = container.resolve<typeof application>(TOKENS.values.expressApp)

const component = container.resolve<RobloxExpressComponent>(TOKENS.components.roblox.component)

component.execute()

const RequestModule = container.resolve<AxiosModule>(TOKENS.modules.request)

app.listen(3000 , () => console.log('Live on PORT 3000'))