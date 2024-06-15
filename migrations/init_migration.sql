-- Drop tables if they exist
DROP TABLE IF EXISTS Account CASCADE;
DROP TABLE IF EXISTS Message CASCADE;
DROP TABLE IF EXISTS Customer CASCADE;
DROP TABLE IF EXISTS CustomerNote CASCADE;

-- Drop enum if it exists
DO
$$
    BEGIN
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'typesender') THEN
            DROP TYPE typesender;
        END IF;
    END
$$;

-- Create Customer table
CREATE TABLE Customer
(
    ID   SERIAL PRIMARY KEY,
    Name VARCHAR(255) NOT NULL
);

-- Create enum Role
CREATE TYPE TypeRole AS ENUM ('Agent', 'Manager');

-- Create Account table
CREATE TABLE Account
(
    ID       SERIAL PRIMARY KEY,
    Email    VARCHAR(255) NOT NULL,
    Password VARCHAR(255) NOT NULL,
    Role     TypeRole     NOT NULL
);

-- Create enum TypeSender
CREATE TYPE TypeSender AS ENUM ('Sender', 'Receiver');

-- Create Message table
CREATE TABLE Message
(
    ID         SERIAL PRIMARY KEY,
    Sender     TypeSender NOT NULL,
    CustomerID INT REFERENCES Customer (ID),
    AccountID  INT REFERENCES Account (ID),
    Message    TEXT       NOT NULL,
    DateTime   TIMESTAMP  NOT NULL
);

-- Create CustomerNote table
CREATE TABLE CustomerNote
(
    ID         SERIAL PRIMARY KEY,
    CustomerID INT REFERENCES Customer (ID),
    Notes      TEXT NOT NULL
);

ALTER TABLE Customer ADD COLUMN Platform VARCHAR(255);