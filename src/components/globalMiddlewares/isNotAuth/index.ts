import { isNotAuthMiddleware } from "./isNotAuth";
import { Middleware } from "@common/middleware";

const isNotAuthMiddlewareHandler = new isNotAuthMiddleware().execute()

export default new Middleware(isNotAuthMiddlewareHandler)