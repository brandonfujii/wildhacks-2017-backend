// @flow

export default class BaseError extends Error {
    statusCode: ?number;
    name: string;
    message: string;

    constructor(msg: ?string) {
        super();

        this.statusCode = null;
        this.name = 'Error';
        this.message = msg || 'Oops, something went wrong!';
    }
}