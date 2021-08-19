import "reflect-metadata";
import { TOKENS } from "./di";
import { container } from "tsyringe";

import appConfig from "@config/"
import { WebSocketServer } from "@socketServer/index";
import { LoggerModule } from "@modules/logger/types";

const logger = container.resolve<LoggerModule>(TOKENS.modules.logger)
const wsServer = container.resolve<WebSocketServer>(TOKENS.websocket.server);

(async() => {
    await wsServer.listen({ port : appConfig.socketServer.port })
    logger.info(`Socket server is now listening on Port : ${appConfig.socketServer.port}.`)
})()