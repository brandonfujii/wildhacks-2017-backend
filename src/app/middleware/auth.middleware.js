// @flow

import jwt from 'jsonwebtoken';
import { to } from '../utils';
import {
    TokenExpirationError,
    UnauthorizedError
} from '../errors';
import tokenController from '../controllers/token.controller';

const stripToken = function(authHeader: string): ?string {
    let [ bearer, token ] = authHeader.split(' ');

    // Must be in format Bearer <AuthToken> in header
    if (bearer.toLowerCase() === 'bearer' && token) {
        return token;
    }
    
    return null;
}

const authMiddleware = async function(req: $Request, res: $Response, next: express$NextFunction): Promise<void> {
    let accessToken = req.headers['x-access-token'];

    if (accessToken) {
        let token = stripToken(accessToken);

        if (!token) {
            next(new UnauthorizedError());
            return;
        }

        let { err, data: decoded } = await to(tokenController.verifyToken(token));

        if (err != null) {
            if (err instanceof jwt.TokenExpiredError) {
                next(new TokenExpirationError());
                return;
            }

            next(new UnauthorizedError());
            return;
        }

        if (decoded) {
            req.auth = true;
            req.requester = decoded;
            next();
            return;
        }
    }

    next(new UnauthorizedError());
    return;
}

export default authMiddleware;