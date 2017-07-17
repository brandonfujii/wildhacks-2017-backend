// @flow

import Sequelize from 'sequelize';
import express from 'express';
import userController from '../controllers/user.controller';
import debug from 'debug';

import { 
    to,
    wrap,
    isEmail
} from '../utils';
import {
    InternalServerError,
    BadRequestError,
    EntityValidationError
} from '../errors';

const log = debug('api:user');

export default function(app: express$Application) {
    let userRouter = express.Router();

    userRouter.post('/create', wrap(async (req: $Request, res: $Response) => {
        const {
            firstName,
            lastName,
            email,
            password,
            privilege
        } = req.body;

        if (isEmail(email) && password) {
            let { err, data } = await to(userController
                                .createUser(req.body));
            if (err != null) {
                if (err instanceof Sequelize.ValidationError) {
                   throw new EntityValidationError(null, err.errors);
                }

                throw new InternalServerError(null);
            }

            res.json({ user: data });

        } else {
            throw new BadRequestError('You must supply a valid email and password');
        }
    }));

    userRouter.get('/all', wrap(async (req: $Request, res: $Response) => {
        let pageNumber = parseInt(req.query.page);

        if (!pageNumber || pageNumber < 1) {
            res.status(400).json('Please supply a valid integer page number greater than 1');
        }

        const { err, data } = await to(userController.getUsers(pageNumber));
        
        if (err != null) {
            res.status(500).json('Something went wrong. Cannot retrieve users');
        }

        res.json({ 
            page: pageNumber,
            users: data ? data : [] 
        });
    }));

    userRouter.get('/', wrap(async (req: $Request, res: $Response) => {
        const email = req.query.email;
        const userId = parseInt(req.query.id);
        let error, user;

        if (email && userId) {
            const { err, data } = await to(userController
                                            .getUserByIdAndEmail(userId, email));
            error = err;
            user = data; 
        } else {
            if (!email && !userId) {
                res.status(400).send('Please supply either a valid email or id parameter');
            }

            if (email) {
                const { err, data } = await to(userController
                                            .getUserByEmail(email));
                error = err;
                user = data;
            }

            if (userId) {
                const { err, data } = await to(userController
                                            .getUserById(userId));
                error = err;
                user = data;
            }
        }

        if (error != null) {
            log(error);
            res.status(500).json('Something went wrong');
        }

        if (user) {
            res.json({ user });
        } else {
            res.status(404).send('User does not exist');
        }
    }));

    app.use('/user', userRouter);
}