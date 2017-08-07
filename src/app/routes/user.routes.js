// @flow

import express from 'express';

import userController from '../controllers/user.controller';
import { 
    normalizeString,
    isEmail, 
} from '../utils';
import { 
    wrap,
    authMiddleware
} from '../middleware';
import {
    BadRequestError,
    NotFoundError,
} from '../errors';

export default function(app: express$Application) {
    const userRouter = express.Router();

    const getUserPage = async (req: $Request, res: $Response) => {
        const pageNumber = parseInt(req.query.page),
            limit = parseInt(req.query.limit) 
                ? parseInt(req.query.limit)
                : undefined;

        if (!pageNumber || pageNumber < 1) {
            throw new BadRequestError('Please supply a valid integer page number greater than 1');
        }

        const users = await userController.getUsers(pageNumber, limit);
    
        res.json({ 
            page: pageNumber,
            users: users ? users : [],
        });
    };

    const getSingleUser = async (req: $Request, res: $Response) => {
        const email = normalizeString(req.query.email);
        const userId = parseInt(req.query.id);
        let user = null;

        if (email && userId) {
            user = await userController.getUserByIdAndEmail(userId, email);
        } else {
            if (!email && !userId) {
                throw new BadRequestError('Please supply either a valid email or id parameter');
            }

            if (email) {
                user = await userController.getUserByEmail(email);
            }

            if (userId) {
                user = await userController.getUserById(userId);
            }
        }

        if (user) {
            res.json({ user });
        } else {
            throw new NotFoundError('The requested user does not exist');
        }
    };

    userRouter.use(authMiddleware);
    userRouter.get('/', wrap(getSingleUser));
    userRouter.get('/all', wrap(getUserPage));
    app.use('/user', userRouter);
}