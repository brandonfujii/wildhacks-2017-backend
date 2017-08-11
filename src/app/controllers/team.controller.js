// @flow

import models from '../models';

import userController from './user.controller';
import {
    NotFoundError,
    TeamError,
} from '../errors';
import type { SuccessMessage } from '../types';

const DEFAULT_MAX_TEAM_MEMBERS = 4;

const getTeamById = async function(id: number): Promise<?models.Team> {
    return models.Team.findOne({
        where: { id, },
        include: [{
            model: models.User, 
        }],
    });
};

const getTeamByName = async function(name: string): Promise<?models.Team> { 
    return models.Team.findOne({
        where: { name: name.toLowerCase() },
        include: [{
            model: models.User,
        }],
    });
};

const _userCanJoinTeam = function(team: models.Team, userId: number): boolean {
    let teamMembers = (team.Users || []).map(user => user.id);

    if (team.numTeamMembers() >= DEFAULT_MAX_TEAM_MEMBERS) {
        throw new TeamError('Team has the maximum number of members allowed');
    }

    if (team.isTeamMember(userId)) {
        throw new TeamError('User is already on team');
    }

    return true;
};

const createOrJoinTeam = async function(name: string, userId: number): Promise<?models.Team> {
    return new Promise(async (resolve, reject) => {
        const t = await models.sequelize.transaction();
        let team;

        try {
            let [ existingTeam, user ] = await Promise.all([
                    getTeamByName(name),
                    userController.getUserById(userId),
                ]);

            if (!user) {
                throw new NotFoundError('User was not found');
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

const leaveTeam = async function(name: string, userId: number): Promise<SuccessMessage> {
    return new Promise(async (resolve, reject) => {
        const t = await models.sequelize.transaction();

        try {
            let [ teamToBeRemoved, user ] = await Promise.all([
                    getTeamByName(name),
                    userController.getUserById(userId),
                ]);

            if (teamToBeRemoved && user) {
                if (teamToBeRemoved.isTeamMember(user.id)) {
                    let updatedUser = await user.update({
                        team_id: null,
                    });

                    resolve({ 
                        success: true, 
                        message: null 
                    });
                } else {
                    reject(new TeamError(`User is not a team member of ${teamToBeRemoved.name}`));
                }

            } else {
                reject(new NotFoundError('Team or user was not found'));
            } 

            await t.commit();
        } catch(err) {
            reject(err);
            await t.rollback();
        }
    });
};

export default {
    getTeamByName,
    createOrJoinTeam,
    leaveTeam,
};
