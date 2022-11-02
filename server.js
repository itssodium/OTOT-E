const express = require("express");
const axios = require("axios");
const cors = require("cors");
const Redis = require("redis");

const client = Redis.createClient();
const EXPIRATION = 300;

(async () => {
    await client.connect();
    console.log('client is connected')
})();

const app = express();
app.use(express.urlencoded({extended: true}));
app.use(cors());

app.get('/data', async (req, res) => {
    const value = await client.get('pictures') 
    if (value != null) {
        console.log('cache hit');
        return res.json(JSON.parse(value));
    } else {
        const {data} = await axios.get("http://jsonplaceholder.typicode.com/photos");
        client.setEx('pictures', EXPIRATION, JSON.stringify(data));
        res.json(data);
    }
    
})

app.listen(3000)