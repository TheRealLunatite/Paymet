import express , { application , ErrorRequestHandler } from "express"
import { TOKENS } from "./di"
import { container } from "tsyringe"
import { AuthExpressComponent } from "@components/auth/express"
import { RobloxExpressComponent } from "@components/roblox/express"
import { TransactionExpressComponent } from "@components/transaction/express"

import { WebSocketServer } from "@modules/socketServer/types"
import { LoggerModule } from "@modules/logger/types"
import { DiscordBotModule } from "src/discordBot/types"
import appConfig from "@config/"

import { Intents } from "discord.js"
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

const wsServer = container.resolve<WebSocketServer>(TOKENS.modules.socketServer)

const robloxComponent = container.resolve<RobloxExpressComponent>(TOKENS.components.roblox.component)
robloxComponent.execute()

const authComponent = container.resolve<AuthExpressComponent>(TOKENS.components.auth.component)
authComponent.execute()

const transactionComponent = container.resolve<TransactionExpressComponent>(TOKENS.components.transaction.component)
transactionComponent.execute()

const discordBot = container.resolve<DiscordBotModule>(TOKENS.modules.discordBot)

app.use(logErrorHandler)
app.use(errorHandler)

async function test() {
    await wsServer.listen({ port : 8080 })
    logger.info("Socket server is now listening on Port : 8080")
    app.listen(3000 , () => logger.info("Express server is now listening on Port : 3000"))

    const { user } = await discordBot.execute(appConfig.discord , {
        presence : {
            status : "dnd",
            afk : true,
            activities : [{ name : "YOUR MOM GETTING RAILED." , type : "WATCHING" }]
        },
        intents : [Intents.FLAGS.GUILDS , Intents.FLAGS.GUILD_MESSAGES]
    })

    if(user) {
        logger.info(`${user.username} #${user.discriminator} is now online.`)
    } else {
        logger.warn("There was a problem establishing a websocket connection to Discord.")
    }
}

test()