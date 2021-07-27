import { Middleware } from "@common/middleware";
import { RetrieveTransactionValidation } from "./retrieveTransactionValidation";

const RetrieveTransactionValidationMiddleware = new RetrieveTransactionValidation().execute()
export default new Middleware(RetrieveTransactionValidationMiddleware)