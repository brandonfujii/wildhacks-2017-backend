// @flow

import express from 'express';
import Sequelize from 'sequelize';
import debug from 'debug';

import authController from '../controllers/auth.controller';
import userController from '../controllers/user.controller';

import { isEmail } from '../utils';
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
            email,
            password,
        } = req.body;


        if (isEmail(email) && password) {
            try {
                let admin = await authController.createUser({
                                                    email,
                                                    password,
                                                    privilege: 'admin'
                                                });
                res.json({ 
                    success: true,
                    user: admin
                });
            } catch(err) {
                log(err);

                if (err instanceof Sequelize.ValidationError) {
                   throw new EntityValidationError(null, err.errors);
                }
                throw new InternalServerError();
            }
        } else {
            throw new BadRequestError('You must supply a valid email and password');
        }
    };

    const deleteUserById = async (req: $Request, res: $Response) => {
        let userId = parseInt(req.query.id);

        if (userId) {
            try {
                let result = await userController.deleteUserById(userId);
                return res.json(result);
            } catch(err) {
                log(err);
                throw new InternalServerError();
            }
        }

        throw new BadRequestError('You must supply a valid id');
    };

    adminRouter.use(authMiddleware);
    adminRouter.use(adminMiddleware);
    adminRouter.post('/register', registerAdminUser);
    adminRouter.delete('/user/delete', deleteUserById);
    app.use('/admin', adminRouter)
}