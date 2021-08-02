import { Middleware } from "@common/middleware";
import { GetTotalPrice } from "./getTotalPrice";

const GetToalPriceMiddleware = new GetTotalPrice().execute()
export default new Middleware(GetToalPriceMiddleware)