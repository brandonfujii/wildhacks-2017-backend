// @flow

import _ from 'lodash';
import sequelize from 'sequelize';
import models from '../models';

import userController from './user.controller';
import resumeController from '../controllers/resume.controller';
import UploadService from '../services/upload.service';
import {
    NotFoundError,
    BadRequestError,
} from '../errors';
import type {
    ResumeFile,
} from '../types';

export const VALID_DECISIONS = ['accepted', 'rejected', 'waitlisted', 'undecided'];
export const VALID_RSVP_VALUES = ['yes', 'no', 'undecided'];
export const VALID_APPLICATION_PROPERTIES = ['first_name', 'last_name', 'age', 'ethnicity', 'grad_year', 'school', 'major', 'personal_website', 'num_prev_hackathons', 'github_username', 'rsvp'];

const getApplicationById = async function(id: number): Promise<?models.Application> {
    return models.Application.findOne({
        where: { id },
    });
};

const getApplicationByUserId = async function(userId: number): Promise<?models.Application> {
  return models.Application.findOne({
      where: {
          user_id: userId,
      }
  });
};

const _saveApplication = async function(t: sequelize.Transaction, userId: number, options: Object): Promise<?models.User> {
    return new Promise(async (resolve, reject) => {
        try {
            const user = await userController.getUserById(userId);
            const skills = options.skills;
            options = _.pick(options, VALID_APPLICATION_PROPERTIES);


            if (user) {
                const existingApplication = user.application_id ? await getApplicationById(user.application_id) : null;

                if (existingApplication) {
                    const [updatedApplication, appSkills] = await Promise.all([
                            existingApplication.update(options, { transaction: t, }),
                            _addSkills(t, existingApplication.id, skills),
                        ]);
                    resolve(updatedApplication);
                } else {
                    const application = await models.Application.create({
                        user_id: userId,
                        ...options,
                    }, { transaction: t, });

                    let updatedUser = await Promise.all([
                            user.update({
                                application_id: application.id,
                            }, { transaction: t, }),
                            _addSkills(t, application.id, skills),
                        ]);

                    resolve(application);
                }
            } else {
                throw new NotFoundError('The user was not found');
            }

        } catch(err) {
            reject(err);
        }
    });
};

const _findSkillsByMetaValue = async function(skillValues: Array<string>): Promise<Array<models.Skill>> {
    return models.Skill.findAll({
        where: {
            meta_value: {
                $in: skillValues,
            }
        },
        attributes: ['id'],
    });
}

const _addSkills = async function(t: sequelize.Transaction, applicationId: number, skillValues: Array<string>): Promise<?Array<models.ApplicationSkill>> {
    return new Promise(async (resolve, reject) => {
        try {
            const options = { 
                ignoreDuplicates: true,
                transaction: t,
            };
            const skillInstances = _.map(await _findSkillsByMetaValue(skillValues), skill => {
                return {
                    skill_id: skill.id,
                    application_id: applicationId,
                };
            });

            const skills = await models.ApplicationSkill.bulkCreate(skillInstances, options);
            resolve(skills);

        } catch(err) {
            reject(err);
        }
    });
};

const handleApplicationAndResume = async function(userId: number, 
        appOptions: Object, file: ?ResumeFile, resumeStore: UploadService): Promise<?models.Application> {

    return new Promise(async (resolve, reject) => {
        const t = await models.sequelize.transaction();

        try {
            let application = await _saveApplication(t, userId, appOptions);
            let result = {};

            if (application && file) {
                result = await resumeController.uploadResume(t, resumeStore, file, application.id);
                const resume = result ? result.resume : null; 

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
                });
            }

            await t.commit(); 

        } catch(err) {
            reject(err);
            await t.rollback();
        }
    });
};

const judgeApplication = async function(applicationId: number, decision: string): Promise<?models.Application> {
    return new Promise(async (resolve, reject) => {
        if (VALID_DECISIONS.includes(decision)) {
            const [ t, application ] = await Promise.all([
                models.sequelize.transaction(),
                getApplicationById(applicationId),
            ]);

            try {
                if (application) {
                    const updatedApplication = await application.update({
                        decision,
                    }, { transaction: t, });

                    resolve(updatedApplication);

                    await t.commit();

                } else {
                    throw new NotFoundError('Could not find application with given id');
                }

            } catch(err) {
                reject(err);
                await t.rollback();
            }
        }
    });
};

const updateRsvp = async function(userId: number, rsvpValue: string): Promise<?models.Application> {
    return new Promise(async (resolve, reject) => {
        if (VALID_RSVP_VALUES.includes(rsvpValue)) {
            const [ t, application ] = await Promise.all([
                models.sequelize.transaction(),
                getApplicationByUserId(userId),
            ]);

            try {
                if (application) {
                    const updatedApplication = await application.update({
                        rsvp: rsvpValue,
                    }, { transaction: t, });

                    resolve(updatedApplication);
                    await t.commit();

                } else {
                    throw new NotFoundError('Application does not exist');
                }

            } catch(err) {
                reject(err);
                await t.rollback();
            }
        }
    });
};

export default {
    getApplicationById,
    getApplicationByUserId,
    handleApplicationAndResume,
    judgeApplication,
    updateRsvp,
};