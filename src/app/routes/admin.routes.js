// @flow

import express from 'express';
import Sequelize from 'sequelize';
import debug from 'debug';

import authController from '../controllers/auth.controller';
import userController from '../controllers/user.controller';

import { isEmail, normalizeString } from '../utils';
import type { SuccessMessage } from '../types';
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

    const registerAdmin = async (req: $Request, res: $Response) => {
        const email = normalizeString(req.body.email);
        const password = normalizeString(req.body.password);
        const privilege = normalizeString(req.body.privilege);

        if (!isEmail(email) || !password) {
            throw new BadRequestError('You must supply a valid email and password');
        }

        const admin = await authController.createUser({
            email,
            password,
            privilege: 'admin',
        });

        res.json({
            success: true,
            user: admin,
        });
    };

    adminRouter.use(authMiddleware);
    adminRouter.use(adminMiddleware);
    adminRouter.post('/register', registerAdmin);
    app.use('/admin', adminRouter)
}