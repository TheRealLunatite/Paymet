CREATE TABLE paymetUsers (
    id BIGSERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    timestamp timestamptz DEFAULT NOW(),
    CONSTRAINT CHK_USER_LENGTH CHECK (length(username) >= 3 or length(username) <= 20)
);


INSERT INTO paymetUsers (
    username,
    password
) VALUES (
    'Khai931',
    'helloworld'
);