import { Router } from "express";
import { autoInjectable, inject } from "tsyringe";
import { TOKENS } from "src/di";
import { v4 as uuid } from "uuid";

import { IExpressRoute } from "@common/interfaces/IExpressRoute";
import { Uuid } from "@common/uuid";

import { TransactionModule } from "@modules/transaction/types";
import { IRobloxModule } from "@modules/roblox/types";

import CreateTransactionValidationMiddleware from "../../middleware/createTransactionValidation";
import ValidateItemsMiddleware from "../../middleware/validateItems"
import GetTotalPriceMiddleware from "../../middleware/getTotalPrice"
import { Cookie } from "@common/cookie";
import { Id } from "@common/id";


@autoInjectable()
export class CreateTransactionRoute implements IExpressRoute {
    constructor(
        @inject(TOKENS.modules.transactionDb) private transactionDb? : TransactionModule,
        @inject(TOKENS.modules.roblox) private roblox? : IRobloxModule,
        @inject(TOKENS.values.uuid) private v4? : typeof uuid
    ) {}

    execute(router : Router) : void {
        router.post('/create' , CreateTransactionValidationMiddleware.value , ValidateItemsMiddleware.value , GetTotalPriceMiddleware.value , async (req , res , next) => {
            try {
                const totalPriceInRobux = req.totalPriceInRobux!
                const createDevProduct = this.roblox!.createDeveloperProduct(new Cookie("_|WARNING:-DO-NOT-SHARE-THIS.--Sharing-this-will-allow-someone-to-log-in-as-you-and-to-steal-your-ROBUX-and-items.|_955BAC699D788BB8EE913306148A2F8126C74625290ADCE101C7069FFF140F3BB69209032EBF90577743A1771C593D423CE6EDAC4D4725F1EAE04ACBDA89F038520CB7F080B8ADF6E02BBB5E228EAA4751A39270F085C3F490188F8C6C0ACC29155A5402AA140ED64AC0A9D7418B2E7D128E601C8B945FFD73C3226FF6FD2BABF50F1AEE2CBCA03881EF6EC202BCF4B1C294E505DFF7279CF601F7A0A2EF59EEB45A45867AF77620ED84B3042F695963576920F3469A024AAD630E0B0633269E21397652C624033A08CB3F8863106DBB8E00B3F9F37FE62F0AE415DD0DC8695FFE8130A20BC44CE9518B10E58867AA7242F2B586BCD72CEACF3590E45879B0D1B6AEE4A48FE26B4FC0A7F9F6F806E399E2BB2F2A3DFD2331599A51EF17C751F315BA08FE08A985821A78C146FD2A8D0489BDD43F7958D5314330E8B4222404C0F12E392702BC8DD695D1BB9520A62E2C5685D88D") , { placeId : new Id(5303144823) , name : this.v4!() , priceInRobux : totalPriceInRobux })

                console.log(await createDevProduct)

                return res.send('hi')
            } catch (e) {
                return next(e)
            }


        })
    }
}