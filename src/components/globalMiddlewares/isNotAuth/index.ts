import { isNotAuthMiddleware } from "./isNotAuth";
import { Middleware } from "@common/middlware";

const isNotAuthMiddlewareHandler = new isNotAuthMiddleware().execute()

export default new Middleware(isNotAuthMiddlewareHandler)