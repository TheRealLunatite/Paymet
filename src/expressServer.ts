import "reflect-metadata";
import express , { application , ErrorRequestHandler } from "express"
import { TOKENS } from "./di"
import { container } from "tsyringe"
import appConfig from "@config/"
import { LoggerModule } from "@modules/logger/types"
import { AuthExpressComponent } from "@components/auth/express"
import { RobloxExpressComponent } from "@components/roblox/express"

const app = container.resolve<typeof application>(TOKENS.values.expressApp)
const logger = container.resolve<LoggerModule>(TOKENS.modules.logger)


const logErrorHandler : ErrorRequestHandler = function(err , req , res , next) {
    logger.error(`${req.url} : ${err.message}`)
    next(err)
}

const errorHandler : ErrorRequestHandler = function(err , req , res , next) {
    return res.status(500).send("Internal Server Error.")
}

app.use(express.json())

const robloxComponent = container.resolve<RobloxExpressComponent>(TOKENS.components.roblox.component)
robloxComponent.execute()

const authComponent = container.resolve<AuthExpressComponent>(TOKENS.components.auth.component)
authComponent.execute()

app.use(logErrorHandler)
app.use(errorHandler);

(async () => {
    app.listen(appConfig.expressServer.port , () => logger.info(`Express server is now listening on Port : ${appConfig.expressServer.port}.`))
})()