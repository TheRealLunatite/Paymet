export interface LoggerModule {
    log(message : string) : void,
    error(message : string) : void,
    warn(message : string) : void,
    info(message : string) : void
}