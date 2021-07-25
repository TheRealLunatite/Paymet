import { CreateTransactionRoute } from "./create"
import { RetrieveTransactionRoute } from "./retrieve"
import { UpdateTransactionRoute } from "./update"

export default [
    new CreateTransactionRoute(),
    new UpdateTransactionRoute(),
    new RetrieveTransactionRoute()
]