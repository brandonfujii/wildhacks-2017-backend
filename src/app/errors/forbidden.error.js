// @flow

import BaseError from './base.error';

export default class ForbiddenError extends BaseError {
    constructor(msg: ?string) {
        super();

        this.statusCode = 403;
        this.name = 'Forbidden Error';
        this.message = msg || 'You do not have permission to access this resource';
    }
}