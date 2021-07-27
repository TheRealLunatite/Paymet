import { Middleware } from "@common/middleware";
import { UpdateTransactionValidation } from "./updateTransactionValidation";

const UpdateTransactionValidationMiddleware = new UpdateTransactionValidation().execute()
export default new Middleware(UpdateTransactionValidationMiddleware)