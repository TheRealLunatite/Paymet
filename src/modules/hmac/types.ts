export interface HashModule {
    createHash(plainText : string , options? : { algorithm : string }) : string,
    compare(plainText : string , hmac : string) : boolean
}
