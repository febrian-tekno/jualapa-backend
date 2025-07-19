require('dotenv').config();
const redis = require('redis');

const client = redis.createClient({
    url: process.env.REDIS_URL
});

client.on('connect', () => {
    console.log('Connected to Redis Cloud');
});

client.on('error', (err) => {
    console.error('Redis Client Error', err);
});

(async () => {
    await client.connect();
})();

module.exports = client;
