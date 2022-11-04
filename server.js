const express = require("express");
const axios = require("axios");
const cors = require("cors");
const Redis = require("redis");
const MongoClient = require("mongodb").MongoClient;

const redis_client = Redis.createClient();

(async () => {
    await redis_client.connect();
    console.log('client is connected')
})();

const app = express();
app.use(express.urlencoded({extended: true}));
app.use(cors());

app.get('/data', async (req, res) => {
    const value = await redis_client.get('pictures') 
    if (value != null) {
        console.log('cache hit');
        return res.json(JSON.parse(value));
    } else {
        console.log('cache miss');
        MongoClient.connect('mongodb://localhost:27017/').then((client) => {
            const db = client.db("pics");
            const collection = db.collection("pics");
            collection.find().toArray((err, data) => {
                if (err) {
                    res.send(err);
                } else {
                    redis_client.setEx('pictures', 60, JSON.stringify(data));
                    res.send(JSON.stringify(data));
                }
            })
        })
    }
})

app.listen(3000)