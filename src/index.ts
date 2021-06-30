import { application } from "express"
import { TOKENS } from "./di"
import { container } from "tsyringe"
import { AxiosModule } from "@modules/request/axios"
import { RobloxExpressComponent } from "@components/roblox/express"
import { RobloxModule } from "@modules/roblox"
import { Cookie } from "@common/cookie"
import { templateId } from "@common/templateId"

const app = container.resolve<typeof application>(TOKENS.values.expressApp)

const component = container.resolve<RobloxExpressComponent>(TOKENS.components.roblox.component)
component.execute()

const RequestModule = container.resolve<AxiosModule>(TOKENS.modules.request)
const Reblex = container.resolve<RobloxModule>(TOKENS.modules.roblox)

async function test() {
    const universe = await Reblex.createUniverse(new Cookie("_|WARNING:-DO-NOT-SHARE-THIS.--Sharing-this-will-allow-someone-to-log-in-as-you-and-to-steal-your-ROBUX-and-items.|_81AA1FB28E9C7904DE84EFC80CC2EB14B614F1B2EDD8A32414198E7BB0086A30910B16AC4187FC365CF4AAA6C45DBAE8131C31773011267497D93A10D984DE456BECE1B46D68F889A3FDA42276DEEA07ABEA20319A624AE2B5180E8B2DAB7737BC33585CE2679BD1016BF5578888E47B9DD3C591990E6A60E8273EE055FE0449C15AC8AA95A1AB04E743E562CB0FB9990D39CE94C998495B1AA56689EBAF77B13C1BA238CB6F7433D997FBB973CCE22AD7C0B58537AF2B1CBCFDCF2AE1B1FF9B709EED6AC5423ED3A5ECF022F36440D6105CE42E367329E6B6310ACB916E6C85EFCE178D93C568F0AA2E76AE9FD64C8019DCBB91B79904170143BF4A11646ABEC932C5999D910354468134E31B0F7D8356C5857C59B95F9FB51DE119B2E096A35442C714AE91312320282B466FB1053CC55C11BB") , templateId.Suburban)

    console.log(universe)
}

test()

app.listen(3000 , () => console.log('Live on PORT 3000'))