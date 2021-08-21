import "reflect-metadata";
import express , { application , ErrorRequestHandler } from "express"
import { TOKENS } from "./di"
import { container } from "tsyringe"
import appConfig from "@config/"
import { LoggerModule } from "@modules/logger/types"
import { StatusExpressComponent } from "@components/status/express"

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

const statusComponent = container.resolve<StatusExpressComponent>(TOKENS.components.status.component)
statusComponent.execute()

app.use(logErrorHandler)
app.use(errorHandler);

(async () => {
    app.listen(appConfig.expressServer.port , () => logger.info(`Express server is now listening on Port : ${appConfig.expressServer.port}.`))
})()