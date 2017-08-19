// @flow

import express from 'express';

import teamController from '../controllers/team.controller';
import { wrap } from '../middleware';
import { normalizeString } from '../utils';
import {
    BadRequestError,
    NotFoundError,
    UnauthorizedError } from '../errors';

export default function(app: express$Application) {
    const teamRouter = express.Router();

    const getTeamByName = async (req: $Request, res: $Response) => {
        const teamName = normalizeString(req.query.name);

        if (!teamName) {
            throw new BadRequestError('Must provide a team name');
        }

        const team = await teamController.getTeamByName(teamName);

        if (team) {
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

    teamRouter.get('/', wrap(getTeamByName));
    teamRouter.post('/join', wrap(createOrJoinTeam));
    teamRouter.post('/leave', wrap(leaveTeam));
    app.use('/team', teamRouter);
}