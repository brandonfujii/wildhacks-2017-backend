// @flow

import Sequelize from 'sequelize';
import config from 'config';
import jwt from 'jsonwebtoken';

import models from '../models';
import tokenController from './token.controller';
import userController from './user.controller';
import { isEmail, to } from '../utils';
import {
    LoginError,
    EntityAlreadyExistsError,
} from '../errors';

/** 
 * Creates and returns a user instance based on given options
 * @param {object}            options
 * @param {String|undefined}  options.firstName
 * @param {String|undefined}  options.lastName 
 * @param {String}            options.email      
 * @param {String}            options.password    
 * @param {"admin"|"user"}    options.privilege 
 * @returns {Promise<User, Error>} - returns a newly created
 * user if resolved; otherwise, throws an error and rollbacks
 * the user creation transaction
 */
const createUser = async function(options: Object): Promise<models.User> {
    let {
        email,
        password,
        privilege
    } = options;

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
            
            user = await models.User
                        .create(options, { transaction: t });
            await t.commit();
        } catch(err) {
            reject(err);
            await t.rollback();
        }

        resolve(user);
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
            expiresIn
        }, (err, token) => {
            if (err != null) {
                reject(err);
            }

            resolve(token);
        })
    });
};

type TokenPairType = {
    user: models.User,
    token: models.Token
};

/** 
 * Creates a Token instance based on a given auth token and
 * updates its corresponding owner
 * @param   {User}                     user - a user that needs to be authenticated
 * @param   {String}                  token - a JSON web token
 * @returns {Promise<TokenPairType, Error>} - a promise that returns an object
 * that contains a User-Token instance pair when resolved; otherwise rejects an error
 * and rollbacks transaction
 */
const _createTokenInstance = async function(user: models.User, token: string): Promise<TokenPairType> {
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
 * @returns {Promise<TokenPairType, Error>} - a promise that returns an object
 * that contains a User-Token instance pair when resolved; otherwise rejects an error
 */
const checkToken = async function(user: models.User): Promise<TokenPairType> {
    return new Promise(async (resolve, reject) => {
        const t = await models.sequelize.transaction();

        try {
            let [ existingToken, tokenValue ] = await Promise.all([ 
                            tokenController.getTokenByUserId(parseInt(user.id)),
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
}

export default {
    createUser,
    verifyUser,
    checkToken
};