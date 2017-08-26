// @flow

import responseMiddleware from './response.middleware';
import requestMiddleware from './request.middleware';
import authMiddleware from './auth.middleware';
import adminMiddleware from './admin.middleware';
import httpMiddleware from './http.middleware';
import errorHandler from './error.middleware';
import wrap from './wrap.middleware';

module.exports.responseMiddleware = responseMiddleware;
module.exports.requestMiddleware = requestMiddleware;
module.exports.authMiddleware = authMiddleware;
module.exports.adminMiddleware = adminMiddleware;
module.exports.httpMiddleware = httpMiddleware;
module.exports.errorHandler = errorHandler;
module.exports.wrap = wrap;
