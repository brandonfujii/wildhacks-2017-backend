// @flow

import sequelize from 'sequelize';
import models from '../models';

import userController from './user.controller';
import {
    NotFoundError,
} from '../errors';

const DEFAULT_MAX_TEAM_MEMBERS = 4;

const getTeamByName = async function(name: string): Promise<?models.Team> { 
    return models.Team.findOne({
        where: { name, },
        include: [{
            model: models.User,
        }],
    });
};

const _userCanJoinTeam = function(team: models.Team, userId: number): boolean {
    let teamMembers = (team.Users || []).map(user => user.id);

    if (teamMembers.length >= DEFAULT_MAX_TEAM_MEMBERS) {
        throw new Error('Too many members');
    }

    if (teamMembers.indexOf(userId) > -1) {
        throw new Error('Already on team');
    }

    return true;
};

const createOrJoinTeam = async function(name: string, creatorId: number): Promise<?models.Team> {
    return new Promise(async (resolve, reject) => {
        const t = await models.sequelize.transaction();
        let team;

        try {
            let [ existingTeam, user ] = await Promise.all([
                    getTeamByName(name),
                    userController.getUserById(creatorId),
                ]);

            if (!user) {
                throw new NotFoundError('Team creator was not found');
            } else {
                if (existingTeam) {
                    team = _userCanJoinTeam(existingTeam, user.id) ? existingTeam : null;
                } else {
                    team = await models.Team.create({
                        name,
                    }, { transaction: t, });
                }

                if (team) {
                    let updatedUser = await user.update({
                        team_id: team.id,
                    }, { transaction: t, });

                    if (team.Users) {
                        team.Users.push(updatedUser);
                    } else {
                        team = Object.assign(team.toJSON(), {
                            users: [ updatedUser ],
                        });
                    }
                }

                resolve(team);
                await t.commit();
            }
        } catch(err) {
            reject(err);
            await t.rollback();
        }
    });
};

export default {
    getTeamByName,
    createOrJoinTeam,
};


