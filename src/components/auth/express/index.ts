import { application , Router } from "express";
import { IExecutable } from "@common/interfaces/IExecutable";
import { IExpressRoute } from "@common/interfaces/IExpressRoute";
import { TOKENS } from "src/di";
import { inject, injectable, Lifecycle, scoped } from "tsyringe";

@injectable()
@scoped(Lifecycle.ContainerScoped)
export class AuthExpressComponent implements IExecutable {
    private authRouter : Router

    constructor(@inject(TOKENS.values.expressApp) private app : typeof application , @inject(TOKENS.values.expressRouter) private router : typeof Router , @inject(TOKENS.components.auth.routes) private routes : IExpressRoute[]) {
        this.authRouter = this.router()
    }

    execute() : void {
        this.routes.forEach((route) => route.execute(this.authRouter))

        this.app.use('/auth' , this.authRouter)
    }
}