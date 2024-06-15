-- Seed Customer table with 10 customers with random names
INSERT INTO Customer (Name) VALUES
                                ('Alice'), ('Bob'), ('Charlie'), ('David'), ('Eve'),
                                ('Frank'), ('Grace'), ('Heidi'), ('Ivan'), ('Judy');

-- Seed Account table with 3 agents
INSERT INTO Account (Email, Password, Role) VALUES
                                                ('agent1@example.com', 'password1', 'Agent'),
                                                ('agent2@example.com', 'password2', 'Agent'),
                                                ('agent3@example.com', 'password3', 'Agent');

-- Function to generate random integer within a range
CREATE OR REPLACE FUNCTION random_range(min INT, max INT)
    RETURNS INT AS $$
BEGIN
    RETURN FLOOR(random() * (max - min + 1)) + min;
END;
$$ LANGUAGE plpgsql;

-- Seed Message table with conversations between customers and agents
-- Simulate 2 customers each chatting with an agent, with up to 4 messages each
DO $$
    DECLARE
        customer_id1 INT;
        customer_id2 INT;
        agent_id INT;
    BEGIN
        -- Get random customer IDs
        SELECT ID FROM Customer ORDER BY random() LIMIT 1 INTO customer_id1;
        SELECT ID FROM Customer WHERE ID != customer_id1 ORDER BY random() LIMIT 1 INTO customer_id2;

        -- Get random agent ID
        SELECT ID FROM Account WHERE Role = 'Agent' ORDER BY random() LIMIT 1 INTO agent_id;

        -- Customer 1 with Agent
        FOR i IN 1..random_range(2, 4) LOOP
                INSERT INTO Message (Sender, CustomerID, AccountID, Message, DateTime)
                VALUES ('Sender', customer_id1, agent_id, 'Message from Customer 1 to Agent', CURRENT_TIMESTAMP);

                INSERT INTO Message (Sender, CustomerID, AccountID, Message, DateTime)
                VALUES ('Receiver', customer_id1, agent_id, 'Response from Agent to Customer 1', CURRENT_TIMESTAMP);
            END LOOP;

        -- Customer 2 with Agent
        FOR i IN 1..random_range(2, 4) LOOP
                INSERT INTO Message (Sender, CustomerID, AccountID, Message, DateTime)
                VALUES ('Sender', customer_id2, agent_id, 'Message from Customer 2 to Agent', CURRENT_TIMESTAMP);

                INSERT INTO Message (Sender, CustomerID, AccountID, Message, DateTime)
                VALUES ('Receiver', customer_id2, agent_id, 'Response from Agent to Customer 2', CURRENT_TIMESTAMP);
            END LOOP;
    END $$;

-- Drop the random_range function after use
DROP FUNCTION random_range(INT, INT);