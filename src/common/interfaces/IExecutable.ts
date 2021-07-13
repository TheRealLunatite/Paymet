export interface IExecutable {
    execute() : void
}

export interface IExecutableValue<T> {
    execute() : T
}