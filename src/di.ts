import "reflect-metadata"

import { container } from "tsyringe"

export const TOKENS = {
    values : {
        axiosInstance : Symbol(),
        expressApp : Symbol(),
        postgresLib : Symbol(),
        uuid : Symbol(),
        websocketLib : Symbol(),
        httpLib : Symbol(),
        expressRouter : Symbol(),
        appConfig : Symbol(),
        postgresConfig : Symbol(),
        cryptoLib : Symbol(),
        fsLib : Symbol(),
        jwtLib : Symbol(),
        bcryptLib : Symbol(),
        jwtSecret : Symbol()
    },
    components : {
        roblox : {
            routes : Symbol(),
            component : Symbol()
        },
        auth : {
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
        websocketServer : Symbol(),
        userDb : Symbol(),
        inventoryDB : Symbol()
    }
}


// VALUES
import axios from "axios"
import express from "express"
import postgres from "pg"
import { v4 as uuid } from "uuid"
import ws from "ws"
import appConfig from "@config/"
import http from "http"
import crypto from "crypto"
import fs from "fs"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

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

container.register(TOKENS.values.jwtLib , {
    useValue : jwt
})

container.register(TOKENS.values.bcryptLib , {
    useValue : bcrypt
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

container.register(TOKENS.values.appConfig , {
    useValue : appConfig
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

container.register(TOKENS.values.httpLib , {
    useValue : http
})

container.register(TOKENS.values.fsLib , {
    useValue : fs
})

container.register(TOKENS.values.jwtSecret, {
    useValue : appConfig.jwt.secret
})

// WEBSOCKET

import WebsocketListeners from "src/websocket"

container.register(TOKENS.websocket.listeners , {
    useValue : WebsocketListeners
})

// MODULES

import { AxiosModule } from "@modules/request/axios"
import { RobloxModule } from "@modules/roblox"
import { PostgresModule } from "@modules/postgres/pg"
import { TransactionDBModule } from "@modules/transaction"
import { WebSocketServerModule } from "@modules/websocketServer"
import { UserDBModule } from "@modules/user"
import { InventoryDBModule } from "@modules/inventory"

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

container.register<UserDBModule>(TOKENS.modules.userDb , {
    useClass : UserDBModule
})

container.register<WebSocketServerModule>(TOKENS.modules.websocketServer , {
    useClass : WebSocketServerModule
})

container.register<InventoryDBModule>(TOKENS.modules.inventoryDB , {
    useClass : InventoryDBModule
})

// ROUTES

import RobloxExpressComponentRoutes from "@components/roblox/express/routes"
import AuthExpressComponentRoutes from "@components/auth/express/routes"

container.register(TOKENS.components.roblox.routes , {
    useValue : RobloxExpressComponentRoutes
})

container.register(TOKENS.components.auth.routes , {
    useValue : AuthExpressComponentRoutes
})

// COMPONENTS

import { RobloxExpressComponent } from "@components/roblox/express"
import { AuthExpressComponent } from "@components/auth/express"

container.register(TOKENS.components.roblox.component , {
    useClass : RobloxExpressComponent
})

container.register(TOKENS.components.auth.component , {
    useClass : AuthExpressComponent
})