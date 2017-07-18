// @flow

import Sequelize from 'sequelize';
import BadRequestError from './bad-request.error';

export default class LoginError extends BadRequestError {
    constructor(msg: ?string) {
        super();
        
        this.message = msg || 'Login failed!';
    }
}