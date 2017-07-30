// @flow

import BaseError from './base.error';

export default class EntityTooLargeError extends BaseError {
    constructor(msg: ?string) {
        super();

        this.statusCode = 413;
        this.name = 'Entity Too Large Error';
        this.message = msg || 'The provided resource is too large';
    }
}