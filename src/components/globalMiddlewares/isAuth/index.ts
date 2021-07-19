import { isAuthMiddleware } from "./isAuth";
import { Middleware } from "@common/middlware";

const isAuthMiddlewareHandler = new isAuthMiddleware().execute()

export default new Middleware(isAuthMiddlewareHandler)