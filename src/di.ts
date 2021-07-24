import "reflect-metadata"

import { container } from "tsyringe"
import { ISocket } from "@common/interfaces/ISocket"

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
        jwtSecret : Symbol(),
        transactionHmacSecret : Symbol()
    },
    components : {
        roblox : {
            routes : Symbol(),
            component : Symbol()
        },
        auth : {
            routes : Symbol(),
            component : Symbol()
        },
        transaction : {
            routes : Symbol(),
            component : Symbol()
        }
    },
    listeners : {
        websocket : Symbol(),
    },
    modules : {
        request : Symbol(),
        hmac : Symbol(),
        roblox : Symbol(),
        postgres : Symbol(),
        transactionDb : Symbol(),
        websocketServer : Symbol(),
        userDb : Symbol(),
        inventoryDb : Symbol()
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

container.register(TOKENS.values.appConfig , {
    useValue : appConfig
})

container.register(TOKENS.values.transactionHmacSecret , {
    useValue : appConfig.hmac.transactionHmacSecret
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

// MODULES

import { AxiosModule } from "@modules/request/axios"
import { RobloxModule } from "@modules/roblox"
import { PostgresModule } from "@modules/postgres/pg"
import { TransactionDBModule } from "@modules/transaction"
import { WebSocketServerModule } from "@modules/websocketServer"
import { UserDBModule } from "@modules/user"
import { InventoryDBModule } from "@modules/inventory"
import { HmacModule } from "@modules/hmac/hmac"

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

container.register<InventoryDBModule>(TOKENS.modules.inventoryDb , {
    useClass : InventoryDBModule
})

container.register<HmacModule>(TOKENS.modules.hmac , {
    useClass : HmacModule
})

// SOCKET LISTENERS

import SocketListeners from "@websocket/listeners"

container.register<ISocket[]>(TOKENS.listeners.websocket , {
    useValue : SocketListeners
}) 

// ROUTES

import RobloxExpressComponentRoutes from "@components/roblox/express/routes"
import AuthExpressComponentRoutes from "@components/auth/express/routes"
import TransactionExpressComponentRoutes from "@components/transaction/express/routes"

container.register(TOKENS.components.roblox.routes , {
    useValue : RobloxExpressComponentRoutes
})

container.register(TOKENS.components.auth.routes , {
    useValue : AuthExpressComponentRoutes
})

container.register(TOKENS.components.transaction.routes , {
    useValue : TransactionExpressComponentRoutes
})

// COMPONENTS

import { RobloxExpressComponent } from "@components/roblox/express"
import { AuthExpressComponent } from "@components/auth/express"
import { TransactionExpressComponent } from "@components/transaction/express"

container.register(TOKENS.components.roblox.component , {
    useClass : RobloxExpressComponent
})

container.register(TOKENS.components.auth.component , {
    useClass : AuthExpressComponent
})

container.register(TOKENS.components.transaction.component , {
    useClass : TransactionExpressComponent
})