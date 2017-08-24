// @flow

import sequelize from 'sequelize';
import config from 'config';
import jwt from 'jsonwebtoken';

import models from '../models';
import tokenController from './token.controller';
import userController from './user.controller';
import EmailService from '../services/email.service';

import { isEmail, to, randomToken } from '../utils';
import type { TokenPair, SuccessMessage } from '../types';
import {
    LoginError,
    EntityAlreadyExistsError,
    ForbiddenError,
    NotFoundError,
} from '../errors';

/** 
 * Creates and returns a user instance based on given options
 * @param {object}            options
 * @param {String|undefined}  options.firstName
 * @param {String|undefined}  options.lastName 
 * @param {String}            options.email      
 * @param {String}            options.password    
 * @returns {Promise<User, Error>} - returns a newly created
 * user if resolved; otherwise, throws an error and rollbacks
 * the user creation transaction
 */
const createUser = async function(options: Object): Promise<TokenPair> {
    const { email } = options;

    return new Promise(async (resolve, reject) => {
        const [t, existingUser] = await Promise.all([
                    models.sequelize.transaction(),
                    userController.getUserByEmail(email),
                ]);

        let user; 
        try {
            if (existingUser) {
                throw new EntityAlreadyExistsError('An account with that email already exists!', 'email');
            }
            
            user = await models.User.create(options, { transaction: t });
            const token = await sendVerification(t, user.id, user.email);

            resolve({
                user,
                token,
            });

            await t.commit();
        } catch(err) {
            reject(err);
            await t.rollback();
        }
    });
};

/** 
 * Creates and returns a user instance based on given options
 * @param {User}                   user - a user that needs to be authenticated
 * @param {String}    candidatePassword - a password to match
 * @returns {Promise<User, LoginError>} - a promise that returns
 * a verified user when resolved; otherwise rejects a login error
 */
const verifyUser = async function(user: models.User, candidatePassword: string): Promise<models.User> {
    return new Promise(async (resolve, reject) => {
        if (!user) {
            reject(new LoginError());
        }

        const { 
            err,
            data: isAuthenticated 
        } = await to(user.verifyPassword(candidatePassword));

        if (err != null) {
            reject(err);
        }

        if (!isAuthenticated) {
            reject(new LoginError());
        }

        resolve(user);
    });
}

/** 
 * Creates an authorization token based on a secret and 
 * user information
 * @param   {User}              user - a user that needs to be authenticated
 * @returns {Promise<String, Error>} - a promise that returns a signed 
 * JSON Web Token when resolved; otherwise rejects an error
 */
const _signToken = async function(user: models.User): Promise<string> {
    const auth = config.get('auth');
    const {
        secret,
        expiresIn
    } = auth;

    return new Promise(async (resolve, reject) => {
        const {
            id,
            email,
            privilege
        } = user;

        jwt.sign({
            id,
            email,
            privilege
        }, 
        secret, {
            expiresIn: expiresIn || '7d',
        }, (err, token) => {
            if (err != null) {
                reject(err);
            }

            resolve(token);
        })
    });
};

/** 
 * Creates a Token instance based on a given auth token and
 * updates its corresponding owner
 * @param   {User}                     user - a user that needs to be authenticated
 * @param   {String}                  token - a JSON web token
 * @returns {Promise<TokenPair, Error>} - a promise that returns an object
 * that contains a User-Token instance pair when resolved; otherwise rejects an error
 * and rollbacks transaction
 */
const _createTokenInstance = async function(user: models.User, token: string): Promise<TokenPair> {
    return new Promise(async (resolve, reject) => {
        const t = await models.sequelize.transaction();
        let tokenInstance;
        let updatedUser;

        try {
            tokenInstance = await models.Token.create({
                user_id: user.id,
                value: token
            }, { transaction: t });

            updatedUser = await user.update({
                token_id: tokenInstance.id
            }, { transaction: t });

            await t.commit();
        } catch(err) {
            await t.rollback();
            reject(err);
        }

        resolve({
            user: updatedUser,
            token: tokenInstance
        });
    });
}

/** 
 * Checks if a user has any existing tokens. If so, it updates its token value;
 * Otherwise it creates a new token instance with the new value
 * @param   {User}                     user - a user that needs to be authenticated
 * @returns {Promise<TokenPair, Error>} - a promise that returns an object
 * that contains a User-Token instance pair when resolved; otherwise rejects an error
 */
const checkToken = async function(user: models.User): Promise<TokenPair> {
    return new Promise(async (resolve, reject) => {
        const t = await models.sequelize.transaction();

        try {
            let [ existingToken, tokenValue ] = await Promise.all([ 
                            tokenController.getAuthTokenByUserId(parseInt(user.id)),
                            _signToken(user) 
                        ]);

            if (existingToken) {
                if (user.token_id != existingToken.id) {
                    let [ updatedUser, updatedToken ] = await Promise.all([
                            user.update({
                                token_id: existingToken.id
                            }, { transaction: t }),
                            existingToken.update({
                                value: tokenValue
                            }, { transaction: t }),
                        ]);

                    user = updatedUser;
                    existingToken = updatedToken;
                } else {
                    existingToken = await existingToken.update({
                        value: tokenValue
                    }, { transaction: t });
                }

                resolve({
                    token: existingToken,
                    user
                });

            } else {
                let tokenPair = await _createTokenInstance(user, tokenValue);
                resolve(tokenPair);
            }

            await t.commit();

        } catch(err) {
            reject(err);
            await t.rollback();
        }
    });
};

const _createVerificationTokenInstance = async function(t: sequelize.Transaction, token: string,
                                                        userId: number): Promise<models.VerificationToken> {
    return new Promise(async resolve => {
        const tokenInstance = await models.VerificationToken.create({
            user_id: userId,
            value: token,
        }, {transaction: t});

        resolve(tokenInstance);
    });
};

const sendVerification = async function(t: sequelize.Transaction, userId: number,
                                               email: string): Promise<models.VerificationToken> {
    return new Promise(async resolve => {

        let [existingVerificationToken, tokenValue] = await Promise.all([
                tokenController.getVerificationTokenByUserId(userId),
                randomToken(),
            ]);

        EmailService.sendVerificationEmail(email, tokenValue);

        if (existingVerificationToken) { // resend email
            const token = await existingVerificationToken.update({
                value: tokenValue,
            }, { transaction: t });
            resolve(token);
        } else {
            const token = await _createVerificationTokenInstance(t, tokenValue, userId);
            resolve(token);
        }
    });
};

const concludeVerification = async function(tokenValue: string, userId: number): Promise<SuccessMessage> {
    return new Promise(async (resolve, reject) => {
        const t = await models.sequelize.transaction();

        try {
            const [token, user] = await Promise.all([
                tokenController.getVerificationTokenByValue(tokenValue),
                userController.getUserById(userId),
            ]);

            if (!user) {
                throw new NotFoundError('User not found');
            }

            if (!token) {
                throw new NotFoundError('Verification token not found');
            }

            if (token.user_id === user.id) {
                await Promise.all([
                    user.update({
                        is_verified: true,
                    }),
                    token.destroy({ force: true }, { transaction: t }),
                ]);

                resolve({
                    success: true,
                    message: `${user.email} has been verified`,
                });

                await t.commit();
            } else {
                throw new ForbiddenError('User does not own this verification token');
            }

        } catch(err) {
            reject(err);
            await t.rollback();
        }
    });
};

export default {
    createUser,
    verifyUser,
    checkToken,
    concludeVerification,
};