const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL, {
  tls: {
    rejectUnauthorized: false,
  },
});

// Logs connection status to Redis
// server when connected successfully
redis.on('connect', () => {
  console.log('Redis connected successfully');
});

// Logs errors if any occur while connecting
// to Redis server or during operations
redis.on('error', (err) => {
  console.log('Redis error:', err);
});

module.exports = redis;
