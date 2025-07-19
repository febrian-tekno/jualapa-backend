const client = require('../utils/redis');

const RATE_LIMIT = 30;      // max 30 requests
const WINDOW_SECONDS = 60;  // per 60 seconds

async function rateLimiter(req, res, next) {
    const ip = req.ip;
    const key = `rate_limit:${ip}`;

    try {
        let count = await client.get(key);

        if (count === null) {
            await client.set(key, 1, { EX: WINDOW_SECONDS });
            next();
        } else if (parseInt(count) < RATE_LIMIT) {
            await client.incr(key);
            next();
        } else {
            res.status(429).json({ message: 'Too Many Requests, slow down!' });
        }
    } catch (err) {
        console.error('Rate Limiter Error:', err);
        next(); // allow request even if Redis fails
    }
}

module.exports = rateLimiter;
