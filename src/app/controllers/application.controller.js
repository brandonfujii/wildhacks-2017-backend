// @flow

import sequelize from 'sequelize';
import models from '../models';

import userController from './user.controller';
import {
    NotFoundError
} from '../errors';

const getApplicationById = async function(id: number): Promise<?models.Application> {
    return models.Application.findOne({
        where: { id },
    });
};

const updateApplication = async function(id: number, options: Object): Promise<?models.User> {
    return new Promise(async (resolve, reject) => {
        const t = await models.sequelize.transaction();

        try {
            let user = await userController.getUserById(id);

            if (user) {
                let existingApplication = user.application_id ? await getApplicationById(user.application_id) : null;

                if (existingApplication) {
                    let updatedApplication = await existingApplication.update(options, { transaction: t, });

                    resolve(updatedApplication);
                } else {
                    let application = await models.Application.create(options, { transaction: t, });
                    let updatedUser = await user.update({
                        application_id: application.id,
                    }, { transaction: t, });

                    resolve(application);
                }

                await t.commit();
            } else {
                reject(new NotFoundError('The user was not found'));
            }

        } catch(err) {
            await t.rollback();
            reject(err);
        }

    });
};

export default {
    getApplicationById,
    updateApplication,
};