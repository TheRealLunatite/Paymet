import { Middleware } from "@common/middleware";
import { CreateTransactionValidation } from "./createTransactionValidation";

const CreateTransactionValidationMiddleware = new CreateTransactionValidation().execute()
export default new Middleware(CreateTransactionValidationMiddleware)