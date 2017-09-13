// @flow

import models from '../models';
import userController from '../controllers/user.controller';

const USER_ATTRIBUTE_BLACKLIST = ['email', 'password', 'privilege', 'token_id', 'application_id', 'verification_token_id', 'is_verified'];
const APPLICATION_ATTRIBUTE_BLACKLIST = ['id', 'first_name', 'last_name', 'personal_website', 'github_username', 'rsvp', 'decision', 'application_status', 'user_id', 'resume_id'];
const SKILL_ATTRIBUTE_BLACKLIST = ['id', 'meta_value', 'created_at', 'updated_at', 'ApplicationSkill'];
const TALK_ATTRIBUTE_BLACKLIST = ['id', 'speaker_id'];
const TEAM_ATTRIBUTE_BLACKLIST = ['id'];
const EVENT_ATTRIBUTE_BLACKLIST = ['id', 'meta_value', 'created_at', 'updated_at'];

const getUsersWithLimit = async function(limit: number, offset: number, options: Object): Promise<Array<models.User>> {
    return models.User.findAll({
        limit,
        offset,
        ...options,
    });
};

const getAllUsers = async function(options: Object): Promise<Array<models.User>> {
    return models.User.findAll(options);
};

const getUsers = async function(pageNumber: number = 1, limit: ?number): Promise<Object> {
    const options = {
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
    };

    return new Promise(async (resolve, reject) => {
        try {
            if (limit) {
                const offset = pageNumber < 1 ? 0 : (pageNumber - 1) * limit;          
                const [users, count] = await Promise.all([
                    getUsersWithLimit(limit, offset, options),
                    userController.getUserCount(),
                ]);

                resolve({
                    page: pageNumber,
                    pageSize: limit,
                    totalPages: Math.ceil(count / limit),
                    count,
                    users,
                });
            } else {
                const users = await getAllUsers(options);

                resolve({
                    count: users.length,
                    users,
                });
            }
        } catch(err) {
            reject(err);
        }
    });
};

const getTeamsWithLimit = async function(limit: number, offset: number, options: Object): Promise<Array<models.Team>> {
    return models.Team.findAll({
        limit,
        offset,
        ...options,
    });
};

const getAllTeams = async function(options: Object): Promise<Array<models.Team>> {
    return models.Team.findAll(options);
};

const getTeams = async function(pageNumber: number = 1, limit: ?number): Promise<Object> {
    const options = {
        attributes: {
            exclude: TEAM_ATTRIBUTE_BLACKLIST,   
        },
        include: [
            {
                model: models.User,
                include: [
                    {
                        model: models.Application,
                        attributes: {
                            exclude: APPLICATION_ATTRIBUTE_BLACKLIST,
                        },
                    },
                ],
                attributes: {
                    exclude: USER_ATTRIBUTE_BLACKLIST,
                }
            }
        ],
    };

    return new Promise(async (resolve, reject) => {
        try {
            if (limit) {
                const offset = pageNumber < 1 ? 0 : (pageNumber - 1) * limit;            
                const [teams, count] = await Promise.all([
                    getTeamsWithLimit(limit, offset, options),
                    models.Team.count(),
                ]);

                resolve({
                    page: pageNumber,
                    pageSize: limit,
                    totalPages: Math.ceil(count / limit),
                    count,
                    teams,
                });
            } else {
                const teams = await getAllTeams(options);

                resolve({
                    count: teams.length,
                    teams,
                });
            }
        } catch(err) {
            reject(err);
        }
    });
};

const getEventsWithLimit = async function(limit: number, offset: number, options: Object): Promise<Array<models.Event>> {
    return models.Event.findAll({
        limit,
        offset,
        ...options,
    });
};

const getAllEvents = async function(options: Object): Promise<Array<models.Event>> {
    return models.Event.findAll(options);
};

const getEvents = async function(pageNumber: number = 1, limit: ?number): Promise<Object> {
    const options = {
        attributes: {
            exclude: EVENT_ATTRIBUTE_BLACKLIST,
        },
    };

    return new Promise(async (resolve, reject) => {
        try {
            if (limit) {
                const offset = pageNumber < 1 ? 0 : (pageNumber - 1) * limit;            
                const [events, count] = await Promise.all([
                    getEventsWithLimit(limit, offset, options),
                    models.Event.count(),
                ]);

                resolve({
                    page: pageNumber,
                    pageSize: limit,
                    totalPages: Math.ceil(count / limit),
                    count,
                    events,
                });
            } else {
                const events = await getAllEvents(options);

                resolve({
                    count: events.length,
                    events,
                });
            }
        } catch(err) {
            reject(err);
        }
    });

};

export default {
  getUsers,
  getTeams,
  getEvents,
};