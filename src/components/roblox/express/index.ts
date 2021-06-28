import { application , Router } from "express";
import { IExecutable } from "src/common/IExecutable";
import { IExpressRoute } from "src/common/IExpressRoute";
import { TOKENS } from "src/di";
import { inject, injectable, Lifecycle, scoped } from "tsyringe";

@injectable()
@scoped(Lifecycle.ContainerScoped)
export class RobloxExpressComponent implements IExecutable {
    private robloxRouter : Router

    constructor(@inject(TOKENS.values.expressApp) private app : typeof application , @inject(TOKENS.values.expressRouter) private router : typeof Router , @inject(TOKENS.components.roblox.routes) private routes : IExpressRoute[]) {
        this.robloxRouter = this.router()
    }

    execute() : void {
        this.routes.forEach((route) => route.execute(this.robloxRouter))

        this.app.use('/roblox' , this.robloxRouter)
    }
}