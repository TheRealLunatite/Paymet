CREATE TABLE inventory (
    socketId uuid PRIMARY KEY,
    userId bigint NOT NULL UNIQUE,
    placeId bigint NOT NULL,
    username text NOT NULL UNIQUE,
    inventory inventoryitem[] NOT NULL,
    CONSTRAINT CHK_USERNAME_CHAR CHECK (length(username) >= 3 or length(username) <= 20)
)

CREATE TYPE inventoryitem as (
    itemName text,
    itemRawName text,
    itemRarity text,
    itemType text,
    itemImage text,
    itemStock integer
);

INSERT INTO inventory(
    socketId,
    userId,
    placeId,
    robloxUser,
    inventory
) VALUES (
    '408deb22-0d54-472e-8e68-48ac8fbc73c4',
    123,
    123,
    'Lunatite',
    ARRAY[('Night','Uncommon','Gun','http://www.roblox.com/Thumbs/Asset.ashx?format=png&width=250&height=250&assetId=159971385',1),('High Tech','Uncommon','Knife','http://www.roblox.com/Thumbs/Asset.ashx?format=png&width=250&height=250&assetId=4659635055',1),('Viper','Legendary','Gun','http://www.roblox.com/Thumbs/Asset.ashx?format=png&width=250&height=250&assetId=160299600',1),('Laser','Classic','Gun','http://www.roblox.com/Thumbs/Asset.ashx?format=png&width=250&height=250&assetId=54798135',1),('Splash','Legendary','Gun','http://www.roblox.com/Thumbs/Asset.ashx?format=png&width=250&height=250&assetId=4659626370',3),('Vampire's Edge','Godly','Knife','http://www.roblox.com/Thumbs/Asset.ashx?format=png&width=250&height=250&assetId=5873256998',1),('Frostbite','Godly','Knife','http://www.roblox.com/Thumbs/Asset.ashx?format=png&width=250&height=250&assetId=4528373246',1)]::inventoryitem[]
);