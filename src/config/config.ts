import dotenv from "dotenv"

const environment = process.env.NODE_ENV?.toLowerCase() || "development"

const { error } = dotenv.config({ path : `.env.${environment}`})

if(error) { 
    throw error
}

function getEnvironmentalVariable(varName : string , defaultValue? : string) : string {
    if(varName in process.env) {
        return process.env[varName]!
    } else {
        if(defaultValue) {
            return defaultValue
        }
    }

    throw new Error(`${varName} environmental variable does not exist and did not have a fallback default value.`)
}

export const config = {
    postgres : {
        host : getEnvironmentalVariable("pgHost" , "localhost"),
        port : getEnvironmentalVariable("pgPort" , "5432"),
        user : getEnvironmentalVariable("pgUser" , "postgres"),
        password : getEnvironmentalVariable("pgPassword"),
        database : getEnvironmentalVariable("pgDatabase")
    },
    jwt : {
        secret : getEnvironmentalVariable("jwtSecret")
    } ,
    hmac : {
        transactionHmacSecret : getEnvironmentalVariable("transactionHmacSecret")
    },
    roblox : {
        cookie : getEnvironmentalVariable("robloxCookie"),
        assetId : +getEnvironmentalVariable("robloxAssetId")
    },
    discord : {
        token : getEnvironmentalVariable("discordBotToken"),
        eventPath : getEnvironmentalVariable("discordEventsDirPath" , "/events/"),
        commandPath : getEnvironmentalVariable("discordCommandsDirPath" , "/commands/")
    },
    socketServer : {
        port : +getEnvironmentalVariable("socketServerPort" , "8080")
    },
    expressServer : {
        port : +getEnvironmentalVariable("expressServerPort" , "3000")
    }
}