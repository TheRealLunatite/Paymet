-- REQUIRED VARIABLES
local WS_URL = "ws://localhost:8080"

-- SERVICES
local Players = game:GetService("Players")
local HttpService = game:GetService("HttpService")
local StarterGUI = game:GetService("StarterGui")


-- VARIABLES
local LocalPlayer = Players.LocalPlayer
local PlaceId = game.PlaceId

if(PlaceId ~= 142823291) then
    LocalPlayer:Kick("This script is only supported for Murder Mystery 2.")
end

local MM2Global = getrenv()._G
local WebSocket

local addMetatable = {
    __add = function(t1 ,t2)
        local arrTable = {}

        for index , value in ipairs(t1) do
            table.insert(arrTable , value)
        end

        for index , value in ipairs(t2) do
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
            local weaponName = weaponData.ItemName
            local weaponType = weaponData.ItemType
            local weaponRarity = weaponData.Rarity
            local weaponImage = convertImageURL(weaponData.Image)
            
            table.insert(weapons, {
                name = weaponName,
                type = weaponType,
                rarity = weaponRarity,
                image = weaponImage,
                stock = ItemStock
            })
        end
    end
    return weapons
end

function getPlayerOwnedPets()
    local pets = setmetatable({} , addMetatable)

    for RawItemName , ItemStock in pairs(MM2PlayerPetsData) do
        local petData = MM2PetsDatabase[RawItemName]
        local petName = petData.Name
        local petRarity = petData.Rarity
        local petType = petData.Type
        local petImage = convertImageURL(petData.Image)

        table.insert(pets , {
            name = petName,
            rarity = petRarity,
            type = petType,
            image = petImage,
            stock = ItemStock
        })
    end

    return pets
end

-- MAIN CODE

local isWebsocketSuccessful = pcall(function()
    WebSocket = syn.websocket.connect(WS_URL)
end)

if not isWebsocketSuccessful then
    LocalPlayer:Kick("Unable to establish a Websocket connection.")
end

StarterGUI:SetCore("SendNotification" , {
    Title = "Paymet",
    Text = "Succesfully established a Websocket connection."
})

WebSocket:Send(HttpService:JSONEncode({
    type = "PlayerConnect",
    userId = LocalPlayer.UserId,
    user = LocalPlayer.Name,
    placeId = PlaceId,
    inventory = getPlayerOwnedWeapons() + getPlayerOwnedPets()
}))

WebSocket.OnClose:Connect(function()
    LocalPlayer:Kick("The socket connection has stopped.")
end)

WebSocket.OnMessage:Connect(function(message)
    
end)