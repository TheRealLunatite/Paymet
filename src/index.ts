import "reflect-metadata";
import express , { application , ErrorRequestHandler } from "express"
import { TOKENS } from "./di"
import { container } from "tsyringe"
import { LoggerModule } from "@modules/logger/types"
import { StatusExpressComponent } from "@components/status/express"
import appConfig from "@config/"
import { WebSocketServer } from "@socketServer/index";
import { DiscordBotModule } from "src/discordBot/types"
import { Intents } from "discord.js"

const discordBot = container.resolve<DiscordBotModule>(TOKENS.discord.bot);
const wsServer = container.resolve<WebSocketServer>(TOKENS.websocket.server);
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
    await wsServer.listen({ port : appConfig.socketServer.port })
    logger.info(`Socket server is now listening on Port : ${appConfig.socketServer.port}.`)
    
    app.listen(appConfig.expressServer.port , () => logger.info(`Express server is now listening on Port : ${appConfig.expressServer.port}.`))

    const { user } = await discordBot.execute(appConfig.discord , {
        presence : {
            status : "dnd",
            afk : true,
            activities : [{ name : "YOUR MOM GETTING RAILED." , type : "WATCHING" }]
        },
        intents : [Intents.FLAGS.GUILDS , Intents.FLAGS.GUILD_MESSAGES]
    })

    user ? logger.info(`${user.username} #${user.discriminator} is now online.`) : logger.warn("There was a problem establishing a websocket connection to Discord.")
})()