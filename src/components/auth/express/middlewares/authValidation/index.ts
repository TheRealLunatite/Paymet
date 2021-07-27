import { Middleware } from "@common/middleware"
import { AuthValidationMiddleware} from "./authValidation"

const AuthValidationMiddlewareHandler = new AuthValidationMiddleware().execute()

export default new Middleware(AuthValidationMiddlewareHandler)