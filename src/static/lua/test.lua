local TradeModule = require(game.ReplicatedStorage.Modules.TradeModule)

local OldUpdateTradeRequestWindowFunc = nil

OldUpdateTradeRequestWindowFunc = hookfunction(TradeModule.UpdateTradeRequestWindow , function(...)
    local type , data = ...

    print(type)

    if(type == "ReceivingRequest") then
        local sender = data.Sender.Name
        print(sender .. " sent you a trade.")
    end

    return OldUpdateTradeRequestWindowFunc(...)
end)

