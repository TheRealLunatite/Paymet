import { Id } from "@common/id";
import { Username } from "@common/username";
import { Uuid } from "@common/uuid";
import * as ws from "ws"

export type WebsocketUser = {
  username : Username,
  userId : Id,
  placeId : Id
}

declare module 'ws' {
  export interface WebSocket extends ws {
      id : Uuid,
      user? : WebsocketUser
   }
}