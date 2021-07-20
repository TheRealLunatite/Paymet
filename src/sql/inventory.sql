CREATE TABLE inventory (
    socketId uuid PRIMARY KEY,
    userId bigint NOT NULL UNIQUE,
    placeId bigint NOT NULL,
    robloxUser text NOT NULL UNIQUE,
    inventory inventoryitem[] NOT NULL,
    CONSTRAINT CHK_ROBLOXUSER_CHAR CHECK (length(robloxUser) >= 3 or length(robloxUser) <= 20)
)

CREATE TYPE inventoryitem as (
    itemName text,
    itemRarity text,
    itemType text,
    itemImage text,
    itemStock bigint
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
    ARRAY[('Reindeer', 'Godly','Knife','https://rbx.cool',1)]::inventoryitem[]
);