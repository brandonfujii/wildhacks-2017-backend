// @flow

import Sequelize from 'sequelize';
import models from '../models';
import { isEmail, to } from '../utils';

const createUser = async function(options: Object): Promise<models.user | void> {
    let {
        firstName,
        lastName,
        email,
        password,
        privilege
    } = options;

    const t = await models.sequelize.transaction();

    try {
        let user = await models.user.create({ email, password },
            { transaction: t });
        await t.commit();
        return user;
    } catch(err) {
        await t.rollback();
    }
};

const getUserByIdAndEmail = async function(id: number, email: string): Promise<models.user> {
    return new Promise(async (resolve, reject) => {
        const { err, data } = await to(models.user.findOne({ where: { email, id }}));

        if (err != null) {
            reject(err);
        }

        resolve(data ? data : null);
    });
};

const getUserByEmail = async function(email: string): Promise<models.user> {
    return new Promise(async (resolve, reject) => {
        const { err, data } = await to(models.user.findOne({ where: { email } }));

        if (err != null) {
            reject(err);
        }

        resolve(data ? data : null);
    });
};

const getUserById = async function(id: number): Promise<models.user> {
    return new Promise(async (resolve, reject) => {
        const { err, data } = await to(models.user.findOne({ where: { id } }));

        if (err != null) {
            reject(err);
        }

        resolve(data ? data : null);
    });
}

export default {
    createUser,
    getUserByIdAndEmail,
    getUserByEmail,
    getUserById
};