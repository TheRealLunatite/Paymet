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
        request : Symbol()
    }
}


// VALUES
import axios from "axios"
import express from "express"

container.register(TOKENS.values.axiosInstance , {
    useValue : axios.create()
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