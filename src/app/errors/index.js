// @flow

// Base Error
import BaseError from './base.error';

// Client Errors
import BadRequestError from './bad-request.error';
import EntityValidationError from './entity-validation.error';
import UnauthorizedError from './unauthorized.error';
import ForbiddenError from './forbidden.error';
import TokenExpirationError from './token-expiration.error';
import EntityTooLargeError from './entity-too-large.error';
import EntityAlreadyExistsError from './entity-already-exists.error';

// Server Errors
import InternalServerError from './internal-server.error';
import NotFoundError from './not-found.error';
import LoginError from './login.error';
import TeamError from './team.error';

module.exports = {
    BaseError,
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    TokenExpirationError,
    EntityTooLargeError,
    EntityValidationError,
    InternalServerError,
    NotFoundError,
    LoginError,
    UnauthorizedError,
    TeamError,
    EntityAlreadyExistsError,
};