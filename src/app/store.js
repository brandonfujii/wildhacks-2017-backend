// @flow

import redis from 'redis';
import debug from 'debug';

const { isProduction, cache } = global.config;
const log = debug('api:redis');
let client;

if (cache && cache.url && isProduction) {
    client = redis.createClient(cache.url);
} else {
    client = redis.createClient();
}

client.on('error', err => {
    log(err);
});

client.on('connect', () => {
    log('Connected to redis data store!');
})

export default client;
