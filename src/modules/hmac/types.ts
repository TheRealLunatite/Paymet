export interface HashModule {
    createHash(plainText : string , key : string , options? : { algorithm : string }) : string,
    compare(plainText : string , hmac : string , key : string) : boolean
}
