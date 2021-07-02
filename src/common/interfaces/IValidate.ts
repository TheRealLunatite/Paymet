export interface IValidate {
    isValid() : boolean
}

export interface IValidatePromise {
    isValid() : Promise<boolean>
}