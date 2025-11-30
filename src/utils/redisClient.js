const Redis = require('ioredis');

const redisUrl = process.env.REDIS_URL || '';

const redisOptions = {};

if (redisUrl.startsWith('rediss://')) {
  redisOptions.tls = {
    rejectUnauthorized: false,
  };
}

const redis = redisUrl ? new Redis(redisUrl, redisOptions) : new Redis(redisOptions);

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
