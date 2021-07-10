-- REQUIRED VARIABLES
local WS_URL = "ws://localhost:8080"

-- SERVICES
local Players = game:GetService("Players")
local HttpService = game:GetService("HttpService")
local StarterGUI = game:GetService("StarterGui")

local LocalPlayer = Players.LocalPlayer

-- WEBSOCKET
local WebSocket
local success , result = pcall(syn.websocket.connect , WS_URL)

if not success then
    LocalPlayer:Kick(result)
end

WebSocket = result

StarterGUI:SetCore("SendNotification" , {
    Title = "Websocket",
    Text = "Succesfully established a connection."
})

WebSocket.OnClose:Connect(function()
    LocalPlayer:Kick("The socket connection has stopped.")
end)

WebSocket.OnMessage:Connect(function(message)
    local json = HttpService:JSONDecode(message)

    if json.eventType == "connected" then
        local playerInfo = HttpService:JSONEncode({
            eventType = "player-info",
            username = LocalPlayer.Name,
            userId = LocalPlayer.UserId,
            placeId = game.PlaceId
        })

        WebSocket:Send(playerInfo)
    end
end)
