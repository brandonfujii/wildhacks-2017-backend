// @flow

import BaseError from './base.error';

export default class NotFoundError extends BaseError {
    constructor(msg: ?string) {
        super();

        this.statusCode = 404;
        this.name = 'Not Found Error';
        this.message = msg || 'The requested resource was not found';
    }
}