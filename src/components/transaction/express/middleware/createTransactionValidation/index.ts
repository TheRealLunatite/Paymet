import { Middleware } from "@common/middlware";
import { CreateTransactionValidation } from "./createTransactionValidation";

const CreateTransactionValidationMiddleware = new CreateTransactionValidation().execute()
export default new Middleware(CreateTransactionValidationMiddleware)