// @flow

import express from 'express';
import _ from 'lodash';

const ResponseMiddleware = function(req: $Request, res: $Response, next: express$NextFunction) {

    next();
}

export default ResponseMiddleware; 