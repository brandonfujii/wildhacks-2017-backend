// @flow

import BaseError from './base.error';

export default class BadRequestError extends BaseError {
    source: ?string;

    constructor(msg: ?string, source: ?string) {
        super();

        this.statusCode = 400;
        this.name = 'Bad Request Error';
        this.message = msg || 'One or more request parameters are invalid';
        this.source = source;
    }
}