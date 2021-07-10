import "reflect-metadata"

import { container } from "tsyringe"

export const TOKENS = {
    values : {
        axiosInstance : Symbol(),
        expressApp : Symbol(),
        postgresLib : Symbol(),
        uuidLib : Symbol(),
        websocketLib : Symbol(),
        httpLib : Symbol(),
        expressRouter : Symbol(),
        appConfig : Symbol(),
        transactionDbConfig : Symbol(),
    },
    components : {
        roblox : {
            routes : Symbol(),
            component : Symbol()
        }
    },
    websocket : {
        listeners : Symbol()
    },
    modules : {
        request : Symbol(),
        roblox : Symbol(),
        postgres : Symbol(),
        transactionDb : Symbol(),
        websocketServer : Symbol()
    }
}


// VALUES
import axios from "axios"
import express from "express"
import postgres from "pg"
import uuid from "uuid"
import ws from "ws"
import appConfig from "@config/"
import http from "http"

container.register(TOKENS.values.axiosInstance , {
    useValue : axios.create({
        // Proxy to Fiddler to log Axios requests.
        proxy : {
            protocol : "http",
            host : "127.0.0.1",
            port : 8866
        }
    })
})

container.register(TOKENS.values.expressApp , {
    useValue : express()
})

container.register(TOKENS.values.expressRouter , {
    useValue : express.Router
})

container.register(TOKENS.values.postgresLib , {
    useValue : postgres
})

container.register(TOKENS.values.uuidLib , {
    useValue : uuid
})

container.register(TOKENS.values.appConfig , {
    useValue : appConfig
})

container.register(TOKENS.values.transactionDbConfig , {
    useValue : appConfig.postgres
})

container.register(TOKENS.values.websocketLib , {
    useValue : ws
})

container.register(TOKENS.values.httpLib , {
    useValue : http
})

// COMPONENTS

import { RobloxExpressComponent } from "@components/roblox/express"

container.register(TOKENS.components.roblox.component , {
    useClass : RobloxExpressComponent
})

// WEBSOCKET

import WebsocketListeners from "src/websocket"

container.register(TOKENS.websocket.listeners , {
    useValue : WebsocketListeners
})

// ROUTES

import RobloxExpressComponentRoutes from "@components/roblox/express/routes"

container.register(TOKENS.components.roblox.routes , {
    useValue : RobloxExpressComponentRoutes
})

// MODULES

import { AxiosModule } from "@modules/request/axios"
import { RobloxModule } from "@modules/roblox"
import { PostgresModule } from "@modules/postgres/pg"
import { TransactionDBModule } from "@modules/transaction"
import { WebSocketServerModule } from "./modules/websocketServer"

container.register<AxiosModule>(TOKENS.modules.request , {
    useClass : AxiosModule
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

container.register<WebSocketServerModule>(TOKENS.modules.websocketServer , {
    useClass : WebSocketServerModule
})