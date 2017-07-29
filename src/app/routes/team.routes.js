// @flow

import Sequelize from 'sequelize';
import express from 'express';
import debug from 'debug';

import teamController from '../controllers/team.controller';
import { isEmail, to } from '../utils';
import { 
    wrap,
} from '../middleware';
import {
    InternalServerError,
    BadRequestError,
    EntityValidationError,
    NotFoundError
} from '../errors';

const log = debug('api:team');

export default function(app: express$Application) {
    let teamRouter = express.Router();

    const createOrJoinTeam = async (req: $Request, res: $Response) => {
        let name = req.body.name,
            userId = parseInt(req.body.user_id);


        if (!userId) {
            throw new BadRequestError('Must provide a valid id');
        }

        if (!name) {
            throw new BadRequestError('Must provide a team name');
        }

        try {
            let team = await teamController.createOrJoinTeam(name, userId);
             res.json({
                success: true,
                team,
            });

        } catch(err) {
            log(err);

            if (err.statusCode === 404) {
                throw new NotFoundError(err.message);
            }

            if (err instanceof Sequelize.ValidationError) {
                throw new EntityValidationError(null, err.errors);
            }

            throw new InternalServerError();
        }
    };

    const getTeamById = async (req: $Request, res: $Response) => {
        let name = req.body.name;

        try {
            let team = await teamController.getTeamByName(name);

            res.json({
                team
            });
        } catch(err) {
            log(err);
            throw new InternalServerError();
        }
    };

    teamRouter.post('/', wrap(getTeamById));
    teamRouter.post('/join', wrap(createOrJoinTeam));
    app.use('/team', teamRouter);
}