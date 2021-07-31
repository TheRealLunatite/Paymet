import { application } from "express"
import { TOKENS } from "./di"
import { container } from "tsyringe"
import { RobloxExpressComponent } from "@components/roblox/express"
import { TransactionExpressComponent } from "@components/transaction/express"
import { WebSocketServerModule } from "@modules/socketServer"
import { AuthExpressComponent } from "@components/auth/express"
import express , { ErrorRequestHandler } from "express"
import { LoggerModule } from "@modules/logger/types"
import { IRobloxModule } from "@modules/roblox/types"
import { Cookie } from "@common/cookie"
import { Id } from "@common/id"

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
app.use(logErrorHandler)
app.use(errorHandler)

const wsServer = container.resolve<WebSocketServerModule>(TOKENS.modules.socketServer)

const robloxComponent = container.resolve<RobloxExpressComponent>(TOKENS.components.roblox.component)
robloxComponent.execute()

const authComponent = container.resolve<AuthExpressComponent>(TOKENS.components.auth.component)
authComponent.execute()

const transactionComponent = container.resolve<TransactionExpressComponent>(TOKENS.components.transaction.component)
transactionComponent.execute()

const robloxModule = container.resolve<IRobloxModule>(TOKENS.modules.roblox)

async function test() {
    const cookie = "_|WARNING:-DO-NOT-SHARE-THIS.--Sharing-this-will-allow-someone-to-log-in-as-you-and-to-steal-your-ROBUX-and-items.|_B34A205AFF769AFA1779B5511CF2FBC5CC97500F0B1D75890A86221178ADBBCBD923B0E8B8780ABCBCF8115E930D3BF8F173F168BAD34C264C4228861FE23EEE5F2182CA8936CACD236193B482DC69CFFF05FB64A3E8398B94E036D9E04B7F91C36E062210BA794D4833328BC6EEA0956A5984B00E85EE767DFB4B77673B0A2CA0D97800C21AD33A7CA41200A66143B2262C022B1CF74B98CC1D0006BAE8C2BDA6C7A931BFC78E584CE616F8D2AE394F9F971DD91FA56D0160CB75D8CD99519F2949BAEF5ECAC88B05A3A14D9CA72267566CD199F3186F44A6A336D937BE129AC2A2D48D23689F3011D8CA6775D574E2479EBE4C9221998AD95260236F633BD70C304F7E7390F093263E4F3CCB9491832BDCD3E37D12252CAE5566BA9D673118497A9A835213B73FBD29B460A706CB1AFBDF3CC41C98C3BE7776FA8282D791CBDECB399A"

    console.log(await robloxModule.createDeveloperProduct(new Cookie(cookie) , {
        universeId : new Id(2688986765),
        name : "Khai93",
        priceInRobux : 5123,
        description : "Buy this please!"
    }))


    await wsServer.listen({ port : 8080 })
    logger.info("Socket server is now listening on Port : 8080")
    app.listen(3000 , () => logger.info("Express server is now listening on Port : 3000"))
}

test()