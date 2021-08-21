import { MessageSocketListener } from "./message";
import { CloseSocketListener } from "./close";

export default [
    new MessageSocketListener(),
    new CloseSocketListener()
]