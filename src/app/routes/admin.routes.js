// @flow

import express from 'express';

import authController from '../controllers/auth.controller';
import { isEmail, normalizeString } from '../utils';
import {
    wrap,
    authMiddleware,
    adminMiddleware
} from '../middleware';
import { BadRequestError } from '../errors';
import { getSingleUser } from './user.routes'

export default function(app: express$Application) {
    const adminRouter = express.Router();

    const registerAdmin = async (req: $Request, res: $Response) => {
        const email = normalizeString(req.body.email);
        const password = normalizeString(req.body.password);

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

    adminRouter.use(adminMiddleware);
    adminRouter.post('/register', wrap(registerAdmin));
    adminRouter.get('/user', wrap(getSingleUser))
    app.use('/admin', adminRouter)
}
