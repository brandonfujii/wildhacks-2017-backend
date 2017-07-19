// @flow

import BaseError from './base.error';

export default class UnauthorizedError extends BaseError {
    constructor(msg: ?string) {
        super();

        this.statusCode = 401;
        this.name = 'Unauthorized Error';
        this.message = msg || 'You cannot access this resource if you are not logged in';
    }
}