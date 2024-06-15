const express = require('express');
const cors = require('cors')

const app = express();
app.use(express.json());
app.use(cors());

const Pool = require('pg').Pool
const pool = new Pool({
    user: 'default',
    host: 'ep-dark-snow-a1n7qzsk-pooler.ap-southeast-1.aws.neon.tech',
    database: 'verceldb',
    password: 'fKl3MEyAB7od',
    port: 5432,
    ssl: {
        rejectUnauthorized: false
    }
})

app.get('/customers', (req, res) => {
    pool.query('SELECT * FROM customer', (error, results) => {
        if (error) {
            throw error
        }
        res.status(200).json(results.rows)
    })
})

// Add new customers and return the customer ID
app.post('/customers', (req, res) => {
    const {name, platform} = req.body;

    pool.query('INSERT INTO Customer (Name, Platform) VALUES ($1, $2) RETURNING ID', [name, platform], (error, results) => {
        if (error) {
            throw error
        }

        let responseString = {
            "id": results.rows[0].id,
            "name": name,
            "platform": platform
        }

        res.status(201).send(responseString)
    })
})

// Agent get list of message
app.get('/message/agent/:id', (req, res) => {
    pool.query(`SELECT DISTINCT Customer.ID, Customer.Name, Customer.Platform FROM Customer INNER JOIN Message ON Customer.ID = Message.CustomerID WHERE Message.AccountID = ${req.params.id};`, (error, results) => {
        if (error) {
            throw error
        }
        res.status(200).json(results.rows)
    })
})

// Agent get message history with customer
app.get('/message/agent/:id/customer/:customerId', (req, res) => {
    pool.query('SELECT * FROM Message WHERE AccountID = $1 AND CustomerID = $2', [req.params.id, req.params.customerId], (error, results) => {
        if (error) {
            throw error
        }
        res.status(200).json(results.rows)
    })
})

// Agent send message to customer
app.post('/message', (req, res) => {
    // i received message in json format "message": "", "agentId": "", "customerId": ""
    const {message, agentId, customerId, senderType, sentimentScore} = req.body;

    pool.query('INSERT INTO Message (Sender, CustomerID, AccountID, Message, DateTime, SentimentScore) VALUES ($1, $2, $3, $4, $5, $6)', [senderType, customerId, agentId, message, new Date(), sentimentScore], (error, results) => {
        if (error) {
            throw error
        }

        res.status(201).send(`Message added`)
    })
})

// SELECT * FROM CustomerNote WHERE CustomerID = 5

// Agent see Customer Notes
app.get('/customer/note/:customerId', (req, res) => {
    pool.query('SELECT * FROM CustomerNote WHERE CustomerID = $1', [req.params.customerId], (error, results) => {
        if (error) {
            throw error
        }
        res.status(200).json(results.rows)
    })
})

async function makeApiRequestChatCustomerCustomerAgent(customerChat, agentContext) {
    // This hypothetical API returns a JSON such as:

    return {
        customerChat: customerChat, agentContext: agentContext,
    };
}

// Executable function code. Put it in a map keyed by the function name
// so that you can call it once you get the name string from the model.
const functions = {
    getAnswerChat: ({customerChat, agentContext}) => {
        return makeApiRequestChatCustomerCustomerAgent(customerChat, agentContext)
    }
};

// Function declaration, to pass to the model.
const getAnswerCustomerChatFunctionDeclaration = {
    name: "getAnswerChat", parameters: {
        type: "OBJECT", description: "Kamu adalah Customer Service, jawablah pertanyaan dari Customer. Kamu bekerja di Line Bank", properties: {
            customerChat: {
                type: "STRING", description: "Pesan dari pelanggan",
            }, agentContext: {
                type: "STRING", description: "Konteks tambahan dari kamu sebagai Customer Service"
            },
        }, required: ["customerChat", "agentContext"],
    },
};

const {GoogleGenerativeAI} = require("@google/generative-ai");

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI("AIzaSyDWKDmSlTfOUQw4lSHrTEoDPW4jdH4XjWs");

const generativeModel = genAI.getGenerativeModel({
    // Use a model that supports function calling, like a Gemini 1.5 model
    model: "gemini-1.5-flash",

    // // Specify the function declaration.
    // tools: {
    //     functionDeclarations: [getAnswerCustomerChatFunctionDeclaration],
    // },
});

// Chat with Gemini
app.post('/chat/test', async (req, res) => {
    // const chat = generativeModel.startChat();
    // const prompt = "Hello, i want to start my savings here";

// Send the message to the model.
//     const result = await chat.sendMessage(prompt);

    const parts = [
        {text: "Kamu adalah Customer Service, jawablah pertanyaan dari Customer. Kamu bekerja di Line, Mekari, IDCloudHost dan Cakap"},
        {text: "input: Fiturnya hanya untuk lihat daftar mobil yang dijual"},
        {text: "output: in json array, first: response for cs and second sentiment analysis score ranged from 1 (angry) to 100 (happy)"},
    ];

    const result = await generativeModel.generateContent([
        "input: Kebutuhan Website Kecil",
        "output: Paket Starter Pro CPU 1 Core Entry Process 10 NPROC 30 Storage 512 MB VRAM 512 MB",
        "input: Kebutuhan Website Besar",
        "output: Paket Advanced Pro CPU 5 Core Entry Process 100 NPROC 150 Storage 35 GB VRAM 4 GB",
        "input: Saya perlu website untuk display daftar mobil",
        "output: (jawablah dengan sopan karena kamu Customer Service dari Mekari, IDCloudHost, Line, Line Bank, Cakap) dalam bentuk format json {summarize: (in list format), response: (answer for cs), sentiment_score: (1 angry-100 happy)}"
    ])

    res.status(200).send(result.response.text());
})

let customerResponse = [

]

app.post('/chat/generate/', async (req, res) => {
    const {
        customerId,
        customerChat,
        agentContext
    } = req.body;

    try {
        const result = await generativeModel.generateContent([
            "input: Kebutuhan Website Kecil",
            "output: Termurah - Paket Starter Pro CPU 1 Core Entry Process 10 NPROC 30 Storage 512 MB VRAM 512 MB",
            "input: Kebutuhan Website Besar",
            "output: Termahal - Paket Advanced Pro CPU 5 Core Entry Process 100 NPROC 150 Storage 35 GB VRAM 4 GB",
            "input: VPS Termurah",
            "output: RAM 1  GB CPU 1 Core Storage Space 20 GB Rp 50.000/Bulan",
            "input: Domain .co.id",
            "output: Domain .co.id Register Rp 270.000 Renewal Rp 300.000 Transfer Rp 270.000",
            "input: WordPress Hosting Termurah",
            "output: Paket Latte Storage Space 15 GB Bandwith Unmetered Web ServerLitespeed Enterprise Rp50.000/Bulan",
            `input: ${customerChat}`,
            ...customerResponse.filter(item => item.userId === customerId).map(item => `output: ${item.message}`),
            `output: agent's recommendation: ${agentContext} - (jawablah dengan sopan karena kamu Customer Service dari IDCloudHost) dalam bentuk format json {summarize: (in list format), response: (answer for cs), sentiment_score: (1 angry-100 happy)}`
        ])

        resultCleaned = result.response.text().replace("```json", "").replace("```", "");
        resultCleanedJSON = JSON.parse(resultCleaned);

        customerResponse.push({
            "userId": customerId,
            "message": customerChat
        })

        res.status(200).send(resultCleanedJSON);
    } catch (e) {
        res.status(500).send({
            "summarize": [],
            "response": "[Sorry, there was an error, please try again]",
            "sentiment_score": 50
        });
    }

})

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log("Server Listening on PORT:", PORT);
});