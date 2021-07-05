CREATE TABLE transaction (
    id uuid PRIMARY KEY,
    status text NOT NULL,
    robloxUser text NOT NULL,
    discordId bigint NOT NULL,
    timestamp timestamptz DEFAULT NOW(), 
    CONSTRAINT CHK_TRANSACTION_STATUS CHECK (status = 'initalized' OR status = 'pending' OR status = 'success'),
    CONSTRAINT CHK_ROBLOXUSER_CHAR CHECK (length(robloxUser) >= 3 or length(robloxUser) <= 20)
);

-- 3 - 20
-- INSERT INTO transcation (
--     id,
--     status,
--     robloxUser,
--     discordid
-- )

-- VALUES('34f0bc0d-b3dd-4c05-a865-963e58496447','initalized' , 'roblox' , 123);


INSERT INTO transcation (
    id,
    status,
    robloxUser,
    discordid
)

VALUES('21f0ba0d-b3dd-4c05-a865-963e58496447','success' , 'roblox' , 12);