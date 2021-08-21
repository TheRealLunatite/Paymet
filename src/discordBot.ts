import "reflect-metadata"
import { Intents, User } from "discord.js"
import { container } from "tsyringe";
import appConfig from "@config/"

import { TOKENS } from "./di";
import { LoggerModule } from "@modules/logger/types"
import { DiscordBotModule } from "src/discordBot/types"

const logger = container.resolve<LoggerModule>(TOKENS.modules.logger)
const discordBot = container.resolve<DiscordBotModule>(TOKENS.discord.bot);

(async () => {
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