// @flow

import Sequelize from 'sequelize';
import express from 'express';
import debug from 'debug';

import userController from '../controllers/user.controller';
import { isEmail, to } from '../utils';
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

const log = debug('api:user');

export default function(app: express$Application) {
    let userRouter = express.Router();

    const getUserPage = async (req: $Request, res: $Response) => {
        let pageNumber = parseInt(req.query.page),
            limit = parseInt(req.query.limit) ? parseInt(req.query.limit) : undefined;

        if (!pageNumber || pageNumber < 1) {
            throw new BadRequestError('Please supply a valid integer page number greater than 1');
        }

        const { err, data } = await to(userController.getUsers(pageNumber, limit));
        
        if (err != null) {
            throw new InternalServerError('Something went wrong. Cannot retrieve users');
        }

        res.json({ 
            page: pageNumber,
            users: data ? data : [] 
        });
    };

    const getSingleUser = async (req: $Request, res: $Response) => {
        const email = req.query.email;
        const userId = parseInt(req.query.id);
        let error, user;

        if (email && userId) {
            const { err, data } = await to(userController.getUserByIdAndEmail(userId, email));
            error = err;
            user = data; 
        } else {
            if (!email && !userId) {
                throw new BadRequestError('Please supply either a valid email or id parameter');
            }

            if (email) {
                const { err, data } = await to(userController.getUserByEmail(email));
                error = err;
                user = data;
            }

            if (userId) {
                const { err, data } = await to(userController.getUserById(userId));
                error = err;
                user = data;
            }
        }

        if (error != null) {
            log(error);
            throw new InternalServerError(error.message);
        }

        if (user) {
            res.json({ user });
        } else {
            throw new NotFoundError('The requested user does not exist')
        }
    };

    userRouter.use(authMiddleware);
    userRouter.get('/', wrap(getSingleUser));
    userRouter.get('/all', wrap(getUserPage));
    app.use('/user', userRouter);
}