import { Middleware } from "@common/middleware";
import { ValidateItems } from "./validateItems";

const CreateTransactionValidationMiddleware = new ValidateItems().execute()
export default new Middleware(CreateTransactionValidationMiddleware)