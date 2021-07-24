import { TOKENS } from "src/di";
import { inject, injectable } from "tsyringe";
import crypto from "crypto"
import { HashModule } from "./types";

@injectable()
export class HmacModule implements HashModule {
    constructor(
        @inject(TOKENS.values.cryptoLib) private cryptoLib : typeof crypto
    ) {}

    public createHash(plainText : string , key : string , options? : { algorithm : string }) : string {
        const hmac = this.cryptoLib.createHmac(options ? options.algorithm : "sha256" , key)
        hmac.update(plainText)
        return hmac.digest("hex")
    }

    public compare(plainText: string, hmac: string , key : string): boolean {
        const hash = this.createHash(plainText , key)
        return hmac === hash
    }
}