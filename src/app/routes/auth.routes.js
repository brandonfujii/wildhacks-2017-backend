// @flow

import express from 'express';
import Sequelize from 'sequelize';
import debug from 'debug';

import authController from '../controllers/auth.controller';
import userController from '../controllers/user.controller';

import { isEmail } from '../utils';
import { wrap } from '../middleware';
import {
    EntityValidationError,
    InternalServerError,
    BadRequestError,
    ForbiddenError,
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
            // Permissable conditions are an unspecified privilege (which defaults to 'user'),
            // or 'user' 
            if (!privilege || privilege === 'user') {

                try {
                    let user = await authController.createUser(req.body);

                    res.json({
                        success: true,
                        user
                    });

                } catch(err) {
                    log(err);

                    if (err instanceof Sequelize.ValidationError) {
                        throw new EntityValidationError(null, err.errors);
                    }

                    throw new InternalServerError();
                }

            } else {
                throw new BadRequestError('Check your privilege');
            }

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
            try {
                let user = await userController.getUserByEmail(email);

                if (user) {
                    let verifiedUser = await authController.verifyUser(user, password);

                    if (verifiedUser) {
                        let tokenPair = await authController.checkToken(verifiedUser);

                        if (tokenPair) {
                            return res.json(tokenPair);
                        }
                    }
                }

                throw new LoginError();

            } catch(err) {
                log(err);
                throw new LoginError();
            }

        } else {
            throw new BadRequestError('You must supply a valid email and password');
        }
    }

    authRouter.post('/register', wrap(registerUser));
    authRouter.post('/login', wrap(loginUser));
    app.use('/auth', authRouter);
}