import "reflect-metadata"

import { container } from "tsyringe"
import { ISocket } from "@common/interfaces/ISocket"

export const TOKENS = {
    values : {
        axiosInstance : Symbol(),
        expressApp : Symbol(),
        postgresLib : Symbol(),
        discordJsLib : Symbol(),
        uuid : Symbol(),
        websocketLib : Symbol(),
        expressRouter : Symbol(),
        appConfig : Symbol(),
        postgresConfig : Symbol(),
        cryptoLib : Symbol(),
        fsLib : Symbol(),
        bcryptLib : Symbol(),
        transactionHmacSecret : Symbol(),
        tsLogger : Symbol(),
        pathJoin : Symbol(),
        robloxConfig : Symbol(),
        discordMessageEmbed : Symbol(),
        discordMessageActionRow : Symbol()
    },
    components : {
        status : {
            routes : Symbol(),
            component : Symbol()
        },
    },
    websocket : {
        server : Symbol(),
        listeners : Symbol(),
        modules : {
            message : Symbol()
        }
    },
    discord : {
        bot : Symbol(),
        commandLoader : Symbol(),
        eventLoader : Symbol()
    },
    modules : {
        logger : Symbol(),
        request : Symbol(),
        hmac : Symbol(),
        roblox : Symbol(),
        postgres : Symbol(),
        transactionDb : Symbol(),
        userDb : Symbol(),
        priceDb : Symbol(),
        instanceDb : Symbol(),
        cartDb : Symbol(),
        discordPagination : Symbol()
    }
}


// VALUES
import axios from "axios"
import express from "express"
import discordjs , { MessageActionRow, MessageEmbed } from "discord.js"
import postgres from "pg"
import path from "path"
import { v4 as uuid } from "uuid"
import ws from "ws"
import appConfig from "@config/"
import crypto from "crypto"
import fs from "fs"
import { Logger } from "tslog"

container.register(TOKENS.values.axiosInstance , {
    useValue : axios.create({
        // Proxy to Fiddler to log Axios requests.
        // proxy : {
        //     protocol : "http",
        //     host : "127.0.0.1",
        //     port : 8866
        // }
    })
})

container.register(TOKENS.values.pathJoin , {
    useValue : path.join
})

container.register(TOKENS.values.appConfig , {
    useValue : appConfig
})

container.register(TOKENS.values.robloxConfig , {
    useValue : appConfig.roblox
})

container.register(TOKENS.values.expressApp , {
    useValue : express()
})

container.register(TOKENS.values.cryptoLib , {
    useValue : crypto
})

container.register(TOKENS.values.expressRouter , {
    useValue : express.Router
})

container.register(TOKENS.values.postgresLib , {
    useValue : postgres
})

container.register(TOKENS.values.postgresConfig , {
    useValue : appConfig.postgres
})

container.register(TOKENS.values.websocketLib , {
    useValue : ws
})

container.register(TOKENS.values.uuid , {
    useValue : uuid
})

container.register(TOKENS.values.fsLib , {
    useValue : fs
})

container.register(TOKENS.values.tsLogger , {
    useValue : new Logger()
})

container.register(TOKENS.values.discordJsLib , {
    useValue : discordjs
})

container.register(TOKENS.values.discordMessageEmbed , {
    useValue : MessageEmbed
})

container.register(TOKENS.values.discordMessageActionRow , {
    useValue : MessageActionRow
})

// MODULES
import { AxiosModule } from "@modules/request/axios"
import { RobloxModule } from "@modules/roblox"
import { PostgresModule } from "@modules/postgres/pg"
import { TransactionDBModule } from "@modules/transactionDb"
import { UserDBModule } from "@modules/user"
import { HmacModule } from "@modules/hmac"
import { TsLoggerModule } from "@modules/logger"
import { PriceDBModule } from "@modules/priceDb"
import { InstanceDBModule } from "@modules/instanceDb"
import { DiscordPagination } from "@modules/discordPagination"
import { CartDBModule } from "@modules/cartDb"

container.register<CartDBModule>(TOKENS.modules.cartDb , {
    useClass : CartDBModule
})

container.register<AxiosModule>(TOKENS.modules.request , {
    useClass : AxiosModule
})

container.register<InstanceDBModule>(TOKENS.modules.instanceDb , {
    useClass : InstanceDBModule
})

container.register<RobloxModule>(TOKENS.modules.roblox , {
    useClass : RobloxModule
})

container.register<PostgresModule>(TOKENS.modules.postgres , {
    useClass : PostgresModule
})

container.register<TransactionDBModule>(TOKENS.modules.transactionDb , {
    useClass : TransactionDBModule
})

container.register<UserDBModule>(TOKENS.modules.userDb , {
    useClass : UserDBModule
})

container.register<HmacModule>(TOKENS.modules.hmac , {
    useClass : HmacModule
})

container.register<TsLoggerModule>(TOKENS.modules.logger , {
    useClass : TsLoggerModule
})

container.register<PriceDBModule>(TOKENS.modules.priceDb , {
    useClass : PriceDBModule
})

container.register<typeof DiscordPagination>(TOKENS.modules.discordPagination , {
    useValue : DiscordPagination
})

// SOCKET MODULES
import MessageModules from "@socketServer/modules"
import { MessageType } from "@socketServer/modules/types"

container.register<Map<MessageType , ISocketModule>>(TOKENS.websocket.modules.message , {
    useValue : MessageModules
})

// SOCKET LISTENERS
import SocketListeners from "@socketServer/listeners"

container.register<ISocket[]>(TOKENS.websocket.listeners , {
    useValue : SocketListeners
})

// SOCKET SERVER
import { WebSocketServer } from "@socketServer/index"

container.register<WebSocketServer>(TOKENS.websocket.server , {
    useClass : WebSocketServer
})


// DISCORD
import { DiscordBot } from "@discordbot/index"
import { DiscordCommandLoader } from "@discordbot/loader/commandLoader"
import { DiscordEventLoader } from "@discordbot/loader/eventLoader"

container.register<DiscordBot>(TOKENS.discord.bot , {
    useClass : DiscordBot
})

container.register<DiscordCommandLoader>(TOKENS.discord.commandLoader , {
    useClass : DiscordCommandLoader
})

container.register<DiscordEventLoader>(TOKENS.discord.eventLoader , {
    useClass : DiscordEventLoader
})

// ROUTES

import StatusExpressComponentRoutes from "@components/status/express/routes"

container.register(TOKENS.components.status.routes , {
    useValue : StatusExpressComponentRoutes
})

// COMPONENTS

import { StatusExpressComponent } from "@components/status/express"
import { ISocketModule } from "@common/interfaces/ISocketModule"

container.register(TOKENS.components.status.component , {
    useClass : StatusExpressComponent
})
