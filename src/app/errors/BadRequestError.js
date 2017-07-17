// @flow

import BaseError from './BaseError';

export default class BadRequestError extends BaseError {
    constructor(msg: ?string) {
        super();

        this.statusCode = 400;
        this.name = 'Bad Request Error';
        this.message = msg || 'One or more request parameters are invalid';
    }
}