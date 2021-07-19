import { Middleware } from "@common/middlware"
import { AuthValidationMiddleware} from "./authValidation"

const AuthValidationMiddlewareHandler = new AuthValidationMiddleware().execute()

export default new Middleware(AuthValidationMiddlewareHandler)