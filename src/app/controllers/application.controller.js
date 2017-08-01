// @flow

import sequelize from 'sequelize';
import models from '../models';

import userController from './user.controller';
import resumeController from '../controllers/resume.controller';
import UploadService from '../services/upload.service';
import {
    NotFoundError
} from '../errors';
import type {
    ResumeFile,
} from '../types';

const getApplicationById = async function(id: number): Promise<?models.Application> {
    return models.Application.findOne({
        where: { id },
    });
};

const updateApplication = async function(applicationId: number, options: Object): Promise<?models.Application> {
    return models.Application.update(
        options, {
            where: {
                id: applicationId,
            },
        },
    );
};

const _saveApplication = async function(t: sequelize.Transaction, userId: number, options: Object): Promise<?models.User> {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await userController.getUserById(userId);

            if (user) {
                let existingApplication = user.application_id ? await getApplicationById(user.application_id) : null;

                if (existingApplication) {
                    let updatedApplication = await existingApplication.update(options, { transaction: t, });

                    resolve(updatedApplication);
                } else {
                    let application = await models.Application.create({
                            user_id: userId,
                            ...options,
                        }, { transaction: t, });
                    let updatedUser = await user.update({
                        application_id: application.id,
                    }, { transaction: t, });

                    resolve(application);
                }
            } else {
                reject(new NotFoundError('The user was not found'));
            }

        } catch(err) {
            reject(err);
        }

    });
};

const handleApplicationAndResume = async function(userId: number, 
        appOptions: Object, file: ?ResumeFile, resumeStore: UploadService): Promise<?models.Application> {
    const t = await models.sequelize.transaction();

    return new Promise(async (resolve, reject) => {

        try {
            let application = await _saveApplication(t, userId, appOptions);
            let result = {};

            if (application && file) {
                result = await resumeController.uploadResume(t, resumeStore, file, application.id);
                let resume = result ? result.resume : null; 

                if (resume) {
                    application = await application.update({
                        resume_id: resume.id,
                    }, { transaction: t });
                }
            }

            if (result) {
                resolve({
                    ...result,
                    application,
                });
            } else {
                resolve({
                    application,
                })
            }

            await t.commit(); 

        } catch(err) {
            reject(err);
            await t.rollback();
        }
    });
};

export default {
    getApplicationById,
    updateApplication,
    handleApplicationAndResume,
};