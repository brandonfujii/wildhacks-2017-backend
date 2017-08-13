// @flow

import jwt from 'jsonwebtoken';

import tokenController from '../controllers/token.controller';
import {
    TokenExpirationError,
    UnauthorizedError
} from '../errors';

const _stripToken = function(authHeader: string): ?string {
    let [ bearer, token ] = authHeader.split(' ');

    // Must be in format Bearer <AuthToken> in header
    if (bearer.toLowerCase() === 'bearer' && token) {
        return token;
    }
    
    return null;
}

const authMiddleware = async function(req: $Request, res: $Response, next: express$NextFunction): Promise<void> {
    let accessToken = req.headers['x-access-token'];

    if (req.originalMethod === 'OPTIONS') {
        next();
        return;
    }

    if (accessToken) {
        let token = _stripToken(accessToken);

        if (!token) {
            next(new UnauthorizedError());
            return;
        }

        try {
            let tokenInstance = await tokenController.getTokenByValue(token);
            let userInfo = await tokenController.verifyToken(tokenInstance);

            if (userInfo) {
                req.auth = true;
                req.requester = userInfo;
                next();
                return;
            }
        } catch(err) {
            if (err instanceof TokenExpirationError) {
                next(new TokenExpirationError());
                return;
            }

            next(new UnauthorizedError());
            return;
        }
    }

    next(new UnauthorizedError());
    return;
}

export default authMiddleware;