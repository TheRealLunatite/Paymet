import { MessageSocketListener } from "./message/message";
import { CloseSocketListener } from "./close/close";

export default [
    new MessageSocketListener(),
    new CloseSocketListener()
]