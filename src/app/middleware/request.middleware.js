// @flow

import _ from 'lodash';

const requestMiddleware = (req: $Request, res: $Response, next: express$NextFunction) => {
    if (req.body) {
        req.body = _.mapKeys(req.body, (v, k) => _.snakeCase(k));
    }

    next();
};

export default requestMiddleware;
