// @flow

import BadRequestError from './bad-request.error';

export default class EntityAlreadyExistsError extends BadRequestError {
    constructor(msg: ?string, source: ?string) {
        super();

        this.statusCode = 400;
        this.name = 'EntityAlreadyExistsError';
        this.source = source;
        this.message = msg || 'Entity could not be created because it already exists';
    }
}