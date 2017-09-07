// @flow

import express from 'express';

import teamController from '../controllers/team.controller';
import { wrap, authMiddleware } from '../middleware';
import { normalizeString } from '../utils';
import {
    BadRequestError,
    NotFoundError,
    UnauthorizedError } from '../errors';

export default function(app: express$Application) {
    const teamRouter = express.Router();

    const obfuscateEmail = (email) => {
        const username = email.substring(0, email.indexOf('@') + 1);
        const domain = email.substring(email.indexOf('@'));

        if (username && domain) {
            return `${username[0]}${(new Array(username.length - 1)).join('*')}${domain}`;
        }

        return email;
    };

    const getTeamByNameOrId = async (req: $Request, res: $Response) => {
        const teamName = normalizeString(req.query.name);
        const teamId = parseInt(req.query.id);
        const requester = req.requester;

        let team;

        if (teamId) {
            team = await teamController.getTeamById(teamId);
        } else if (teamName) {
            team = await teamController.getTeamByName(teamName);
        } else {
            throw new BadRequestError('Must provide a team name or id to fetch team');
        }

        if (team) {
            if (team.Users.length) {
                for (let i = 0, users = team.Users, len = team.Users.length; i < len; ++i) {
                    const teamMember = users[i];

                    if (teamMember.email !== requester.email) {
                        team.Users[i].email = obfuscateEmail(teamMember.email);
                    }
                }
            }

            res.json({
                team,
            });
        } else {
            throw new NotFoundError('Team was not found');
        }
    };
    
    const createOrJoinTeam = async (req: $Request, res: $Response) => {
        const teamName = normalizeString(req.body.name),
            owner = req.requester;

        if (!owner || !owner.id) {
            throw new UnauthorizedError('You cannot create or join a team without being signed in');
        }

        if (!teamName) {
            throw new BadRequestError('Must provide a valid team name string');
        }

        const team = await teamController.createOrJoinTeam(teamName, owner.id);
        res.json({
            success: true,
            team,
        });
    };

    const leaveTeam = async (req: $Request, res: $Response) => {
        const teamName = normalizeString(req.body.name),
            user = req.requester;

        if (!user || !user.id) {
            throw new UnauthorizedError('You cannot leave a team without being signed in');
        }

        if (!teamName) {
            throw new BadRequestError('Must provide a team name');
        }

        const result = await teamController.leaveTeam(teamName, user.id);
        res.json(result);
    };

    teamRouter.use(authMiddleware);
    teamRouter.get('/', wrap(getTeamByNameOrId));
    teamRouter.post('/join', wrap(createOrJoinTeam));
    teamRouter.post('/leave', wrap(leaveTeam));
    app.use('/team', teamRouter);
}