import { LoggerModule } from "./types";
import { Logger } from "tslog";
import { inject, singleton } from "tsyringe";
import { TOKENS } from "src/di";

@singleton()
export class TsLoggerModule implements LoggerModule {
    constructor(
        @inject(TOKENS.values.tsLogger) private tsLogger : Logger
    ) {}

    log(message: string): void {
        this.tsLogger.silly(message)
    }
    error(message: string): void {
        this.tsLogger.error(message)
    }
    warn(message: string): void {
        this.tsLogger.warn(message)
    }
    info(message: string): void {
        this.tsLogger.info(message)
    }
}