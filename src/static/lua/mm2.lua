-- REQUIRED VARIABLES
local WS_URL = "ws://localhost:8080"

-- SERVICES
local Players = game:GetService("Players")
local HttpService = game:GetService("HttpService")
local StarterGui = game:GetService("StarterGui")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

-- REMOTES
local TradeRemotes = ReplicatedStorage:FindFirstChild("Trade")
local AcceptTradeRemote = TradeRemotes.AcceptTrade
local DeclineTradeRemote = TradeRemotes.DeclineTrade
local AcceptRequestRemote = TradeRemotes.AcceptRequest
local DeclineRequestRemote = TradeRemotes.DeclineRequest
local OfferTradeItemRemote = TradeRemotes.OfferItem

-- VARIABLES
local TradeModule = require(game.ReplicatedStorage.Modules.TradeModule)
local LocalPlayer = Players.LocalPlayer
local PlaceId = game.PlaceId

if(PlaceId ~= 142823291) then
    LocalPlayer:Kick("This script is only supported for Murder Mystery 2.")
end

local OldUpdateTradeRequestWindowFunc = TradeModule.UpdateTradeRequestWindow
local MM2Global = getrenv()._G
local WebSocket = nil

local addMetatable = {
    __add = function(t1 ,t2)
        local arrTable = {}

        for _ , value in ipairs(t1) do
            table.insert(arrTable , value)
        end

        for _ , value in ipairs(t2) do
            table.insert(arrTable , value)
        end

        return arrTable
    end
}

-- MM2 PLAYER DATA
local MM2PlayerData = MM2Global.PlayerData
local MM2PlayerWeaponsData = MM2PlayerData.Weapons.Owned
local MM2PlayerPetsData = MM2PlayerData.Pets.Owned

-- MM2 DATABASE THAT HOLDS DATA ON WEAPONS , PETS , AND ETC.
local MM2Database = MM2Global.Database
local MM2WeaponsDatabase = MM2Database.Weapons
local MM2PetsDatabase = MM2Database.Pets

-- MM2 uses mutiple different formats to store a image of an item. We'll use this func to convert the format to one to be used. 
function convertImageURL(string)
    local id

    if (string.match(string , "rbxassetid://")) then
        id = string.split(string,"//")[2]
    elseif (string.match(string , "/asset/?")) then
        id = string.split(string , "?id=")[2]
    elseif(tonumber(string)) then
        id = string
    elseif (string.match(string , "Asset.ashx?")) then
        return string
    end

    if(id ~= nil) then
        return "http://www.roblox.com/Thumbs/Asset.ashx?format=png&width=250&height=250&assetId=" .. id
    end

    return nil
end

function getPlayerOwnedWeapons() 
    local weapons = setmetatable({} , addMetatable)

    for RawItemName , ItemStock in pairs(MM2PlayerWeaponsData) do
        if(RawItemName ~= "DefaultKnife" and RawItemName ~= "DefaultGun") then
            local weaponData = MM2WeaponsDatabase[RawItemName]
            local itemName = weaponData.ItemName
            local itemType = weaponData.ItemType
            local itemRarity = weaponData.Rarity
            local itemImage = convertImageURL(weaponData.Image)
            
            table.insert(weapons, {
                itemName = itemName,
                itemRawName = RawItemName,
                itemRarity = itemRarity,
                itemType = itemType,
                itemImage = itemImage,
                itemStock = ItemStock
            })
        end
    end
    return weapons
end

function getPlayerOwnedPets()
    local pets = setmetatable({} , addMetatable)

    for RawItemName , ItemStock in pairs(MM2PlayerPetsData) do
        local petData = MM2PetsDatabase[RawItemName]
        local itemName = petData.Name
        local itemRarity = petData.Rarity
        local itemType = petData.Type
        local itemImage = convertImageURL(petData.Image)

        table.insert(pets , {
            itemName = itemName,
            itemRawName = RawItemName,
            itemRarity = itemRarity,
            itemType = itemType,
            itemImage = itemImage,
            itemStock = ItemStock
        })
    end
    return pets
end

function offerTradeItems(items)
    for _ , itemData in ipairs(items) do
        for i = 1 , itemData.itemPurchased do
            local args = {
                [1] = itemData.itemRawName,
                [2] = (itemData.itemType == "Knife" or itemData.itemType == "Gun") and "Weapons" or "Pets"
            }
            
            OfferTradeItemRemote:FireServer(unpack(args))
        end
    end
end

function sendToWebsocket(t) 
    if WebSocket and typeof(t) == "table" then
        WebSocket:Send(HttpService:JSONEncode(t))
    end
end

OldUpdateTradeRequestWindowFunc = hookfunction(TradeModule.UpdateTradeRequestWindow , function(...)
    local type , data = ...

    if not checkcaller() and type == "ReceivingRequest" then
        sendToWebsocket({
            type = "ReceivedTradeRequest",
            username = data.Sender.Name
        })
    end

    return OldUpdateTradeRequestWindowFunc(...)
end)

-- MAIN CODE
local isWebsocketSuccessful = pcall(function()
    WebSocket = syn.websocket.connect(WS_URL)
end)

if not isWebsocketSuccessful then
    LocalPlayer:Kick("Unable to establish a Websocket connection.")
end

StarterGui:SetCore("SendNotification" , {
    Title = "Paymet",
    Text = "Succesfully established a Websocket connection."
})

sendToWebsocket({
    type = "PlayerConnect",
    userId = LocalPlayer.UserId,
    username = LocalPlayer.Name,
    placeId = PlaceId,
    inventory = getPlayerOwnedWeapons() + getPlayerOwnedPets()
})

WebSocket.OnClose:Connect(function()
    LocalPlayer:Kick("The socket connection has stopped.")
end)

WebSocket.OnMessage:Connect(function(msg)
    local data  = HttpService:JSONDecode(msg)

    if data.type == "AcceptTradeRequest" then
        local tries = 0

        -- Accept trade request.
        AcceptRequestRemote:FireServer() 
        TradeModule.GUI.RequestFrame.Visible = false
        
        sendToWebsocket({
            type = "AcceptedTradeRequest",
            username = data.username
        })

        -- Try to look for the Trade screen 5 times.
        repeat
            if(LocalPlayer.PlayerGui.TradeGUI.Enabled) then
                break
            end
            tries += 1
            wait(1)
        until tries >= 5

        if(LocalPlayer.PlayerGui.TradeGUI.Enabled) then
            -- Offer trade items that user has purchased.
            offerTradeItems(data.items)

            if(LocalPlayer.PlayerGui.TradeGUI.Enabled) then
                -- Have to wait 6 seconds for the MM2 Trade countdown.
                wait(6)
                AcceptTradeRemote:FireServer()
                sendToWebsocket({
                    type = "AcceptedTrade",
                    username = data.username
                })
            end
        else
            sendToWebsocket({
                type = "TradeFailed",
                username = data.username
            })
        end

    elseif data.type == "DeclineTradeRequest" then
        DeclineRequestRemote:FireServer()
        TradeModule.GUI.RequestFrame.Visible = false

        sendToWebsocket({
            type = "DeclinedTradeRequest",
            username = data.username
        })
    end
end)