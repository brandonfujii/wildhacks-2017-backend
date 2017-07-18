// @flow

import Sequelize from 'sequelize';
import config from 'config';
import jwt from 'jsonwebtoken';

import models from '../models';
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

        console.log(id, email, privilege);

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

const createToken = async function(user: models.User): Promise<models.User> {
    return new Promise(async (resolve, reject) => {
        let {
            err,
            data: token
        } = await to(signToken(user));

        if (err != null) {
            reject(err);
        }

        if (token) {
            const t = await models.sequelize.transaction();
            let tokenInstance;
            let updatedUser;

            try {
                console.log(user);
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

            resolve(updatedUser);
        }
    });
}

export default {
    createUser,
    verifyUser,
    createToken
};