import { application } from "express"
import { TOKENS } from "./di"
import { container } from "tsyringe"
import { RobloxExpressComponent } from "@components/roblox/express"
import { TransactionExpressComponent } from "@components/transaction/express"
import { WebSocketServerModule } from "@modules/socketServer"
import { AuthExpressComponent } from "@components/auth/express"
import express , { ErrorRequestHandler } from "express"
import { LoggerModule } from "@modules/logger/types"
import { InventoryModule } from "@modules/inventory/types"
import { InstanceModule } from "@modules/instances/types"
import { v4 as uuid } from "uuid"
import { Uuid } from "@common/uuid"
import { Id } from "@common/id"
import { Username } from "@common/username"

const logger = container.resolve<LoggerModule>(TOKENS.modules.logger)
const app = container.resolve<typeof application>(TOKENS.values.expressApp)

const logErrorHandler : ErrorRequestHandler = function(err , req , res , next) {
    logger.error(`${req.url} : ${err.message}`)
    next(err)
}

const errorHandler : ErrorRequestHandler = function(err , req , res , next) {
    return res.status(500).send("Internal Server Error.")
}

app.use(express.json())

const wsServer = container.resolve<WebSocketServerModule>(TOKENS.modules.socketServer)

const robloxComponent = container.resolve<RobloxExpressComponent>(TOKENS.components.roblox.component)
robloxComponent.execute()

const authComponent = container.resolve<AuthExpressComponent>(TOKENS.components.auth.component)
authComponent.execute()

const transactionComponent = container.resolve<TransactionExpressComponent>(TOKENS.components.transaction.component)
transactionComponent.execute()

const instanceDb = container.resolve<InstanceModule>(TOKENS.modules.instanceDb)

app.use(logErrorHandler)
app.use(errorHandler)


async function test() {


    await wsServer.listen({ port : 8080 })
    logger.info("Socket server is now listening on Port : 8080")
    app.listen(3000 , () => logger.info("Express server is now listening on Port : 3000"))
}

test()