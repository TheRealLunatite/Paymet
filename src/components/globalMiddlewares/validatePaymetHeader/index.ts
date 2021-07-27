import { Middleware } from "@common/middleware";
import { ValidatePaymetHeader } from "./validatePaymetHeader";

const ValidatePaymetHeaderMiddleware = new ValidatePaymetHeader().execute()

export default new Middleware(ValidatePaymetHeaderMiddleware)