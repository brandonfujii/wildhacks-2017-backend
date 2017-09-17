// @flow

import BaseError from './base.error';

export default class TooManyRequestsError extends BaseError {
    constructor(msg: ?string) {
        super();

        this.statusCode = 429;
        this.name = 'Too Many Requests';
        this.message = msg || 'You\'ve been sending too many requests. This service will be temporarily unavailable';
    }
}