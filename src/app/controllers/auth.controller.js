// @flow

import Sequelize from 'sequelize';
import config from 'config';
import jwt from 'jsonwebtoken';

import models from '../models';
import tokenController from './token.controller';
import { isEmail, to } from '../utils';

const createUser = async function(options: Object): Promise<models.User> {
    let {
        firstName,
        lastName,
        email,
        password,
        privilege
    } = options;

    return new Promise(async (resolve, reject) => {
        const t = await models.sequelize.transaction();
        let user; 
        try {
            user = await models.User
                            .create(options, { transaction: t });
            await t.commit();
        } catch(err) {
            await t.rollback();
            reject(err);
        }

        resolve(user);
    });
};

const verifyUser = async function(user: models.User, candidatePassword: string): Promise<models.User> {
    return new Promise(async (resolve, reject) => {
        if (!user) {
            resolve(new Error('Login failed!'));
        }

        const { 
            err,
            data: isAuthenticated 
        } = await to(user.verifyPassword(candidatePassword));

        if (err != null) {
            resolve(err);
        }

        if (!isAuthenticated) {
            resolve(new Error('Login failed'));
        }

        resolve(user);
    });
}

const signToken = async function(user: models.User): Promise<string> {
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

const checkToken = async function(user: models.User): Promise<TokenPairType> {
    return new Promise(async (resolve, reject) => {
        let {
            err,
            data: existingToken
        } = await to(tokenController.getTokenByUserId(parseInt(user.id)));

        if (err != null) {
            reject(err);
        }

        if (existingToken) {
            if (user.token_id != existingToken.id) {
                let updatedUser = await user.update({
                    token_id: existingToken.id
                });

                resolve({
                    token: existingToken,
                    user: updatedUser
                });
            } else {
                resolve({
                    token: existingToken,
                    user
                });
            }
        } else {
            let {
                err,
                data: token
            } = await to(signToken(user));

            if (err != null) {
                reject(err);
            }

            if (token) {
                let {
                    err,
                    data: tokenPair
                } = await to(createToken(user, token));

                if (err != null) {
                    reject(err);
                }

                resolve(tokenPair);
            }
        }
    });
}

const createToken = async function(user: models.User, token: string): Promise<TokenPairType> {
    return new Promise(async (resolve, reject) => {
        const t = await models.sequelize.transaction();
        let tokenInstance;
        let updatedUser;

        try {
            tokenInstance = await models.Token.create({
                user_id: user.id,
                value: token
            });

            updatedUser = await user.update({
                token_id: tokenInstance.id
            });

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

export default {
    createUser,
    verifyUser,
    checkToken
};