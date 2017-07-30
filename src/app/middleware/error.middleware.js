// @flow

import {
    EntityTooLargeError,
} from '../errors';

const errorHandler: express$Middleware = (err: Object, req: $Request, res: $Response, next: express$NextFunction) => {
    if (err.code === 'LIMIT_FILE_SIZE') {
        res.json(new EntityTooLargeError());
        return;
    }

    return res.status(err.statusCode || 500).send(err);
};

export default errorHandler;