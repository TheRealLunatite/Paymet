import "reflect-metadata"

import { container } from "tsyringe"

export const TOKENS = {
    values : {
        axiosInstance : Symbol(),
        expressApp : Symbol(),
        expressRouter : Symbol()
    },
    components : {
        roblox : {
            routes : Symbol(),
            component : Symbol()
        }
    },
    modules : {
        request : Symbol(),
        roblox : Symbol()
    }
}


// VALUES
import axios from "axios"
import express from "express"

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

container.register(TOKENS.values.expressApp , {
    useValue : express()
})

container.register(TOKENS.values.expressRouter , {
    useValue : express.Router
})

// COMPONENTS

import { RobloxExpressComponent } from "@components/roblox/express"

container.register(TOKENS.components.roblox.component , {
    useClass : RobloxExpressComponent
})

// ROUTES

import RobloxExpressComponentRoutes from "@components/roblox/express/routes"

container.register(TOKENS.components.roblox.routes , {
    useValue : RobloxExpressComponentRoutes
})

// MODULES

import { AxiosModule } from "@modules/request/axios"

container.register<AxiosModule>(TOKENS.modules.request , {
    useClass : AxiosModule
})

import { RobloxModule } from "@modules/roblox"

container.register<RobloxModule>(TOKENS.modules.roblox , {
    useClass : RobloxModule
})