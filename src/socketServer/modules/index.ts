import { PlayerConnectModule } from "./PlayerConnect";
import { DeclinedTradeRequestModule } from "./DeclinedTradeRequest";
import { ReceivedTradeRequestModule } from "./ReceivedTradeRequest";
import { AcceptedTradeModule } from "./AcceptedTrade";
import { MessageType } from "./types";
import { ISocketModule } from "@common/interfaces/ISocketModule";
import { AcceptedTradeRequestModule } from "./AcceptedTradeRequest";

const MessageModules : Map<MessageType , ISocketModule> = new Map()

MessageModules.set("PlayerConnect" , new PlayerConnectModule())
MessageModules.set("AcceptedTradeRequest" , new AcceptedTradeRequestModule())
MessageModules.set("DeclinedTradeRequest" , new DeclinedTradeRequestModule())
MessageModules.set("ReceivedTradeRequest" , new ReceivedTradeRequestModule())
MessageModules.set("AcceptedTrade" , new AcceptedTradeModule())

export default MessageModules