// @flow

import Sequelize from 'sequelize';
import express from 'express';
import debug from 'debug';

import appController from '../controllers/application.controller';
import { 
    wrap,
    authMiddleware
} from '../middleware';
import {
    InternalServerError,
    BadRequestError,
    EntityValidationError,
    NotFoundError
} from '../errors';

const log = debug('api:application');

export default function(app: express$Application) {
    let appRouter = express.Router();

    const createApplication = async (req: $Request, res: $Response) => {
        if (!req.body) {
            throw new BadRequestError('Must include application body');
        }

        if (!req.body.user_id) {
            throw new BadRequestError('Must provide a user id');
        }

        try {
            let application = await appController.createApplication(req.body.user_id, req.body);

            res.json({
                success: true,
                application,
            });

        } catch(err) {
            log(err);

            if (err.name === 'Not Found Error') {
                throw new NotFoundError();
            }

            if (err instanceof Sequelize.ValidationError) {
                throw new EntityValidationError(null, err.errors);
            }

            throw new InternalServerError();
        }
    };

    appRouter.post('/create', wrap(createApplication));
    app.use('/application', appRouter);
}