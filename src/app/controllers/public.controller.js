// @flow

import models from '../models';
import userController from '../controllers/user.controller';

const USER_ATTRIBUTE_BLACKLIST = ['email', 'password', 'privilege', 'token_id', 'application_id'];
const APPLICATION_ATTRIBUTE_BLACKLIST = ['id', 'first_name', 'last_name', 'personal_website', 'github_username', 'rsvp', 'decision', 'application_status', 'user_id', 'resume_id'];
const SKILL_ATTRIBUTE_BLACKLIST = ['id', 'meta_value', 'created_at', 'updated_at', 'ApplicationSkill'];
const TALK_ATTRIBUTE_BLACKLIST = ['id', 'speaker_id'];
const TEAM_ATTRIBUTE_BLACKLIST = ['id'];
const EVENT_ATTRIBUTE_BLACKLIST = ['id', 'meta_value', 'created_at', 'updated_at'];

const getUsers = async function(limit: number = 10, offset: number): Promise<Array<models.User>> {
    return models.User.findAll({
        limit,
        offset,
        attributes: {
            exclude: USER_ATTRIBUTE_BLACKLIST,
        },
        include: [
            {
                model: models.Application,
                include: [{
                    model: models.Skill,
                    attributes: {
                        exclude: SKILL_ATTRIBUTE_BLACKLIST,
                    },
                    through: {
                        attributes: []
                    }
                }],
                attributes: {
                    exclude: APPLICATION_ATTRIBUTE_BLACKLIST,
                },
            },
            {
                model: models.Event,
                attributes: {
                    exclude: EVENT_ATTRIBUTE_BLACKLIST,
                }
            },
            {
                model: models.Talk,
                as: 'talks',
                attributes: {
                    exclude: TALK_ATTRIBUTE_BLACKLIST,
                },
            },
            {
                model: models.Team,
                attributes: {
                    exclude: TEAM_ATTRIBUTE_BLACKLIST,
                }
            },
        ],
    });
};

/**
 * Gets a page of users based on a page number and page limit
 * @param   {number}    pageNumber - the # that corresponds to a subset of Users
 * @param   {number}         limit - the # of users per page
 * @returns {Promise<Object>} - returns Promise containing an
 * array of User instances, page number, page size, and number of total users
 */
const getUserPage = async function(pageNumber: number = 1, limit: number = 10): Promise<Object> {
    const offset = pageNumber < 1 ? 0 : (pageNumber - 1) * limit; // zero-index page number

    return new Promise(async (resolve, reject) => {
        try {
            const [users, count] = await Promise.all([
                getUsers(limit, offset),
                userController.getUserCount(),
            ]);

            resolve({
                page: pageNumber,
                pageSize: limit,
                totalPages: Math.ceil(count / limit),
                totalUsers: count,
                users: users ? users : [],
            });
        } catch(err) {
            reject(err);
        }
    });
};

export default {
  getUserPage,
};