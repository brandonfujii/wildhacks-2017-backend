// @flow

import express from 'express';
import Sequelize from 'sequelize';
import debug from 'debug';

import authController from '../controllers/auth.controller';
import userController from '../controllers/user.controller';

import { isEmail, to } from '../utils';
import { wrap } from '../middleware';
import {
    EntityValidationError,
    InternalServerError,
    BadRequestError,
    LoginError
} from '../errors';

const log = debug('api:auth');

export default function(app: express$Application) {
    let authRouter = express.Router();

    const registerUser = async (req: $Request, res: $Response) => {
        const {
            firstName,
            lastName,
            email,
            password,
            privilege
        } = req.body;

        if (isEmail(email) && password) {
            let { err, data } = await to(authController
                                .createUser(req.body));
            if (err != null) {
                log(err);

                if (err instanceof Sequelize.ValidationError) {
                   throw new EntityValidationError(null, err.errors);
                }

                throw new InternalServerError(null);
            }

            res.json({ 
                success: true,
                user: data
            });

        } else {
            throw new BadRequestError('You must supply a valid email and password');
        }
    };

    const loginUser = async (req: $Request, res: $Response) => {
        const {
            email,
            password
        } = req.body;

        if (isEmail(email) && password) {
            let { 
                err, 
                data: user 
            } = await to(userController.getUserByEmail(email));

            if (err != null) {
                throw new LoginError();
            }

            if (user) {
                let { 
                    err, 
                    data: verifiedUser 
                } = await to(authController.verifyUser(user, password));

                if (err != null) {
                    throw new LoginError();
                }

                if (verifiedUser) {
                    let { 
                        err,
                        data: tokenPair 
                    } = await to(authController.checkToken(verifiedUser));

                    if (err != null) {
                        throw new LoginError();
                    }

                    if (tokenPair) {
                        res.json(tokenPair);
                    }
                }
            } 

            throw new LoginError();

        } else {
            throw new BadRequestError('You must supply a valid email and password');
        }
    }

    authRouter.post('/register', wrap(registerUser));
    authRouter.post('/login', wrap(loginUser));
    app.use('/auth', authRouter);
}