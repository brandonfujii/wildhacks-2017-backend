// @flow

import InternalServerError from './internal-server.error';

export default class TeamError extends InternalServerError {
    constructor(msg: ?string) {
        super();

        this.statusCode = 500;
        this.name = 'Team Error';
        this.message = msg || 'Could not create or update team';
    }
}