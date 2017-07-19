// @flow

import Sequelize from 'sequelize';
import BadRequestError from './bad-request.error';

export default class TokenExpirationError extends BadRequestError {
    constructor(msg: ?string) {
        super();
        
        this.message = msg || 'The given authorization token has expired. Please log in again';
    }
}