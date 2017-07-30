// @flow

import Sequelize from 'sequelize';
import express from 'express';
import debug from 'debug';

import teamController from '../controllers/team.controller';
import { 
    wrap,
} from '../middleware';
import {
    InternalServerError,
    BadRequestError,
    EntityValidationError,
    NotFoundError,
    TeamError,
} from '../errors';

const log = debug('api:team');

export default function(app: express$Application) {
    let teamRouter = express.Router();

    const createOrJoinTeam = async (req: $Request, res: $Response) => {
        let teamName = req.body.name,
            userId = parseInt(req.body.user_id);


        if (!userId) {
            throw new BadRequestError('Must provide a valid id');
        }

        if (!teamName) {
            throw new BadRequestError('Must provide a team name');
        }

        try {
            let team = await teamController.createOrJoinTeam(teamName, userId);
             res.json({
                success: true,
                team,
            });

        } catch(err) {
            log(err);

            if (err.name === 'Not Found Error') {
                throw new NotFoundError(err.message);
            }

            if (err.name === 'Team Error') {
                throw new TeamError(err.message);
            }

            if (err instanceof Sequelize.ValidationError) {
                throw new EntityValidationError(null, err.errors);
            }

            throw new InternalServerError();
        }
    };

    const getTeamByName = async (req: $Request, res: $Response) => {
        let teamName = req.body.name;

        if (!teamName) {
            throw new BadRequestError('Must provide a team name');
        }

        try {
            let team = await teamController.getTeamByName(teamName);

            if (team) {
                res.json({
                    team
                });
            } else {
                throw new NotFoundError('Team was not found');
            }
        } catch(err) {
            log(err);

            throw new InternalServerError();
        }
    };

    const leaveTeam = async (req: $Request, res: $Response) => {
        let teamName = req.body.name,
            userId = req.body.user_id;

        if (!userId) {
            throw new BadRequestError('Must provide a valid id');
        }

        if (!teamName) {
            throw new BadRequestError('Must provide a team name');
        }

        try {
            let result = await teamController.leaveTeam(teamName, userId);
            res.json(result);

        } catch(err) {
            log(err);

            if (err.name === 'Not Found Error') {
                throw new NotFoundError(err.message);
            }

            if (err.name === 'Team Error') {
                throw new TeamError(err.message);
            }
        }
    };

    teamRouter.post('/', wrap(getTeamByName));
    teamRouter.post('/join', wrap(createOrJoinTeam));
    teamRouter.post('/leave', wrap(leaveTeam));
    app.use('/team', teamRouter);
}