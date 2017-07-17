// @flow

import Sequelize from 'sequelize';
import models from '../models';
import { to } from '../utils';

const userAttributes = {
    exclude: ['password']
};

const createUser = async function(options: Object): Promise<models.user> {
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
            user = await models.user
                            .create(options, { transaction: t });
            await t.commit();
        } catch(err) {
            await t.rollback();
            reject(err);
        }
        resolve(user);
    });
};

const getUsers = async function(pageNumber: number = 1, limit: number = 10): Promise<Object> {
    const offset = pageNumber < 1 ? 0 : --pageNumber * limit; // zero-index page number

    return models.user.findAll({
        limit,
        offset,
        attributes: userAttributes
    });
}

const getUserByIdAndEmail = async function(id: number, email: string): Promise<models.user> {
    return models.user.findOne({
        where: {
            email,
            id
        },
        attributes: userAttributes
    });
};

const getUserByEmail = async function(email: string): Promise<models.user> {
    return models.user.findOne({ 
        where: { email },
        attributes: userAttributes
    });
};

const getUserById = async function(id: number): Promise<models.user> {
    return models.user.findOne({ 
        where: { id },
        attributes: userAttributes
    });
}

export default {
    createUser,
    getUsers,
    getUserByIdAndEmail,
    getUserByEmail,
    getUserById
};