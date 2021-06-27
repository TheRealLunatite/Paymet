import express from "express"
import { TOKENS } from "./di"
import { container } from "tsyringe"
import { AxiosModule } from "./modules/request/axios"

const app = express()

const RequestModule = container.resolve<AxiosModule>(TOKENS.modules.request);

app.get('/' , (req , res) => {
    return res.status(200).send('123')
})

app.listen(3000 , () => console.log('Live'))