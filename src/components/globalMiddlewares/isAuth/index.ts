import { isAuthMiddleware } from "./isAuth";
import { Middleware } from "@common/middleware";

const isAuthMiddlewareHandler = new isAuthMiddleware().execute()

export default new Middleware(isAuthMiddlewareHandler)