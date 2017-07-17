// @flow

import Sequelize from 'sequelize';
import BadRequestError from './BadRequestError';

type ValidationErrorType = {
    message: string,
    type: string,
    path: string,
    value: string
};

export default class EntityValidationError extends BadRequestError {
    errors: Array<ValidationErrorType>;

    constructor(msg: ?string, errs: ?Array<ValidationErrorType>) {
        super();
        
        this.message = msg || 'One or more of the request parameters are invalid data types or formats';
        this.errors = errs || [];
    }
}