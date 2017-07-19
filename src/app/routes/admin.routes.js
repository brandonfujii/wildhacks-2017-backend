// @flow

import express from 'express';
import Sequelize from 'sequelize';
import debug from 'debug';

import authController from '../controllers/auth.controller';

import { isEmail, to } from '../utils';
import { 
    wrap,
    authMiddleware,
    adminMiddleware
} from '../middleware';
import {
    EntityValidationError,
    InternalServerError,
    BadRequestError,
} from '../errors';

const log = debug('api:admin');

export default function(app: express$Application) {
    let adminRouter = express.Router();

    const registerAdminUser = async (req: $Request, res: $Response) => {
            const {
                firstName,
                lastName,
                email,
                password
            } = req.body;

            if (isEmail(email) && password) {
                let { err, data } = await to(authController
                                        .createUser({
                                            firstName,
                                            lastName,
                                            email,
                                            password,
                                            privilege: 'admin'
                                        }));

                if (err != null) {
                    log(err);

                    if (err instanceof Sequelize.ValidationError) {
                       throw new EntityValidationError(null, err.errors);
                    }

                    throw new InternalServerError();
                }

                res.json({ 
                    success: true,
                    user: data
                });

            } else {
                throw new BadRequestError('You must supply a valid email and password');
            }
    };

    adminRouter.use(authMiddleware);
    adminRouter.use(adminMiddleware);
    adminRouter.post('/register', registerAdminUser);
    app.use('/admin', adminRouter)
}