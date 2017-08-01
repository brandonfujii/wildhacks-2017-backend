// @flow

import Sequelize from 'sequelize';
import express from 'express';
import debug from 'debug';

import appController from '../controllers/application.controller';
import resumeController from '../controllers/resume.controller';

import UploadService from '../services/upload.service';

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

export default function(app: express$Application, resumeStore: UploadService) {
    let appRouter = express.Router();

    const updateApplication = async (req: $Request, res: $Response) => {
        if (!req.body) {
            throw new BadRequestError('Must include application body');
        }

        const userId = req.body.user_id;

        if (!userId) {
            throw new BadRequestError('Must provide a user id');
        }

        try {
            let result = await appController
                .handleApplicationAndResume(userId, req.body, req.file, resumeStore);

            res.json({
                success: true,
                result,
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

    appRouter.post('/update', resumeStore.multer().single('resume'), wrap(updateApplication));
    app.use('/application', appRouter);
}