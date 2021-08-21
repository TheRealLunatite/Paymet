import { application , Router } from "express";
import { IExecutable } from "@common/interfaces/IExecutable";
import { IExpressRoute } from "@common/interfaces/IExpressRoute";
import { TOKENS } from "src/di";
import { inject, injectable, Lifecycle, scoped } from "tsyringe";

@injectable()
@scoped(Lifecycle.ContainerScoped)
export class StatusExpressComponent implements IExecutable {
    private statusRouter : Router

    constructor(@inject(TOKENS.values.expressApp) private app : typeof application , @inject(TOKENS.values.expressRouter) private router : typeof Router , @inject(TOKENS.components.status.routes) private routes : IExpressRoute[]) {
        this.statusRouter = this.router()
    }

    execute() : void {
        this.routes.forEach((route) => route.execute(this.statusRouter))
        this.app.use('/status' , this.statusRouter)
    }
}