import { application } from "express"
import { TOKENS } from "./di"
import { container } from "tsyringe"
import { AxiosModule } from "@modules/request/axios"
import { RobloxExpressComponent } from "@components/roblox/express"
import { RobloxModule } from "@modules/roblox"
import { Cookie } from "@common/cookie"
import { templateId } from "@common/templateId"
import { RobloxStudioFile } from "@common/robloxStudioFile"
import path from "path"
import { Id } from "@common/id"

const app = container.resolve<typeof application>(TOKENS.values.expressApp)

const component = container.resolve<RobloxExpressComponent>(TOKENS.components.roblox.component)
component.execute()

const RequestModule = container.resolve<AxiosModule>(TOKENS.modules.request)
const Reblex = container.resolve<RobloxModule>(TOKENS.modules.roblox)

app.listen(3000 , () => console.log('Live on PORT 3000'))