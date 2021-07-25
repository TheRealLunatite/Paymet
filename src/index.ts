import { application } from "express"
import { TOKENS } from "./di"
import { container } from "tsyringe"
import { RobloxExpressComponent } from "@components/roblox/express"
import { TransactionExpressComponent } from "@components/transaction/express"
import { WebSocketServerModule } from "@modules/socketServer"
import { AuthExpressComponent } from "@components/auth/express"
import express , { ErrorRequestHandler } from "express"

const app = container.resolve<typeof application>(TOKENS.values.expressApp)

app.use(express.json())

const logErrorHandler : ErrorRequestHandler = function(err , req , res , next) {
    console.log(err.message)
    next(err)
}

const errorHandler : ErrorRequestHandler = function(err , req , res , next) {
    return res.status(500).send("Internal Server Error.")
}

const wsServer = container.resolve<WebSocketServerModule>(TOKENS.modules.socketServer)

const robloxComponent = container.resolve<RobloxExpressComponent>(TOKENS.components.roblox.component)
robloxComponent.execute()

const authComponent = container.resolve<AuthExpressComponent>(TOKENS.components.auth.component)
authComponent.execute()

const transactionComponent = container.resolve<TransactionExpressComponent>(TOKENS.components.transaction.component)
transactionComponent.execute()

app.use(logErrorHandler)
app.use(errorHandler)

async function test() {
    await wsServer.listen({ port : 8080 })
    console.log('Websocket listening on port 8080.')
    app.listen(3000 , () => console.log('Express server listening on Port : 3000.'))
}

test()


// app.listen(3000 , () => console.log('Live on PORT 3000'))

// id uuid NOT NULL