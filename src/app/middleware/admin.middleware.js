// @flow

import {
    UnauthorizedError,
    ForbiddenError
} from '../errors';

/**
 * Middleware for routes that require admin privileges to access
 * @throws {ForbiddenError} - if the requester's privilege is not admin or
 * the request does not contain a gatekey
 */
const adminMiddleware = async function(req: $Request, res: $Response, next: express$NextFunction): Promise<void> {
    if (req.requester) {
        if (req.requester.privilege === 'admin') {
            next();
            return;
        }
    }

    if (req.headers['x-access-gatekey']) {
        const gatekey = global.config.auth.gatekey;

        if (req.headers['x-access-gatekey'] === gatekey) {
            next();
            return;
        } else {
            next(new ForbiddenError());
            return;
        }
    }

    next(new ForbiddenError());
    return;
}

export default adminMiddleware;