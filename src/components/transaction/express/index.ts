import { application , Router } from "express";
import { IExecutable } from "@common/interfaces/IExecutable";
import { IExpressRoute } from "@common/interfaces/IExpressRoute";
import { TOKENS } from "src/di";
import { inject, injectable, Lifecycle, scoped } from "tsyringe";

@injectable()
@scoped(Lifecycle.ContainerScoped)
export class TransactionExpressComponent implements IExecutable {
    private transactionRouter : Router

    constructor(@inject(TOKENS.values.expressApp) private app : typeof application , @inject(TOKENS.values.expressRouter) private router : typeof Router , @inject(TOKENS.components.transaction.routes) private routes : IExpressRoute[]) {
        this.transactionRouter = this.router()
    }

    execute() : void {
        this.routes.forEach((route) => route.execute(this.transactionRouter))

        this.app.use('/transaction' , this.transactionRouter)
    }
}