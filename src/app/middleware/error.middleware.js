// @flow

import Sequelize from 'sequelize';
import debug from 'debug';
import {
    EntityTooLargeError,
    EntityValidationError,
} from '../errors';

const log = debug('api:error');

const errorHandler: express$Middleware = (err: Object, req: $Request, res: $Response, next: express$NextFunction) => {
    log(err);

    if (err.code === 'LIMIT_FILE_SIZE') {
        res.json(new EntityTooLargeError());
        return;
    }

    if (err instanceof Sequelize.ValidationError) {
        res.json(new EntityValidationError(null, err.errors));
        return;
    }

    return res.status(err.statusCode || 500).send(err);
};

export default errorHandler;