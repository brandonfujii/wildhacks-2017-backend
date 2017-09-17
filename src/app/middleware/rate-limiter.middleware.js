// @flow

import RateLimiter from 'rolling-rate-limiter';
import { TooManyRequestsError, InternalServerError } from '../errors';
import { stripToken } from '../utils';

const rateLimitingMiddleware = (store: redis.client) => {
    const rateLimitInterval = process.env.RATE_LIMIT_INTERVAL || 60000;
    const limiter = RateLimiter({
        redis: store,
        namespace: 'requestRateLimiter',
        interval: rateLimitInterval,
        maxInInterval: process.env.RATE_LIMIT_MAX_IN_INTERVAL || 100,
    });
    
    return (req: $Request, res: $Response, next: express$NextFunction) => {
        const accessToken = req.headers['x-access-token'];
        res.setHeader('X-RateLimit-Limit', rateLimitInterval);

        if (accessToken) {
            const key = stripToken(accessToken);

            limiter(key, (err, timeRemaining) => {
                if (err != null) {
                    return next(new InternalServerError());
                }            
                if (timeRemaining) {
                    res.setHeader('X-RateLimit-Remaining', timeRemaining);                
                    return next(new TooManyRequestsError());
                }
            });
        }

        return next();
    };
};

export default rateLimitingMiddleware;
