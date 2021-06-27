import "reflect-metadata"

import { container } from "tsyringe"

export const TOKENS = {
    values : {
        axiosInstance : Symbol()
    },
    modules : {
        request : Symbol()
    }
}

// VALUES
import axios from "axios"

container.register(TOKENS.values.axiosInstance , {
    useValue : axios.create()
})

// MODULES

import { AxiosModule } from "./modules/request/axios"

container.register<AxiosModule>(TOKENS.modules.request , {
    useClass : AxiosModule
})
