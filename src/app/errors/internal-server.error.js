// @flow

import BaseError from './base.error';

export default class InternalServerError extends BaseError {
    constructor(msg: ?string) {
        super();

        this.statusCode = 500;
        this.name = 'Internal Server Error';
        this.message = msg || 'An unknown error occurred';
    }
}