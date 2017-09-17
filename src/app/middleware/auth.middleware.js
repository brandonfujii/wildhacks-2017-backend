// @flow

import jwt from 'jsonwebtoken';

import tokenController from '../controllers/token.controller';
import { TokenExpirationError, UnauthorizedError } from '../errors';
import { stripToken } from '../utils';

const authMiddleware = async function(req: $Request, res: $Response, next: express$NextFunction): Promise<void> {
    const accessToken = req.headers['x-access-token'];

    if (req.originalMethod === 'OPTIONS') {
        return next();
    }

    if (accessToken) {
        console.log(accessToken);
        const token = stripToken(accessToken);

        if (!token) {
            return next(new UnauthorizedError());
        }

        try {
            const tokenInstance = await tokenController.getAuthTokenByValue(token);
            const userInfo = await tokenController.verifyToken(tokenInstance);

            if (userInfo) {
                req.auth = true;
                req.requester = userInfo;
                return next();
            }
        } catch(err) {
            if (err instanceof TokenExpirationError) {
                return next(new TokenExpirationError());
            }

            return next(new UnauthorizedError());
        }
    }

    return next(new UnauthorizedError());
}

export default authMiddleware;