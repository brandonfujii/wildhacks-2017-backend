// @flow

import Sequelize from 'sequelize';
import models from '../models';
import debug from 'debug';

const log = debug('api:controller:user');


const createUser = async (options: Object) => {
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
        console.error(err);
        return err;
    }
}

export default {
    createUser
};