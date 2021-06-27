import express from "express"
import { TOKENS } from "./di"
import { container } from "tsyringe"
import { AxiosModule } from "@modules/request/axios"

const app = express()

const RequestModule = container.resolve<AxiosModule>(TOKENS.modules.request);

app.get('/' , async (req , res) => {
    const { status , data } = await RequestModule.request({ url : "https://roblox.com" , method : "GET"})
    return res.status(status).send(data)
})

app.listen(3000 , () => console.log('Live'))