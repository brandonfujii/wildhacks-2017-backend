// @flow

import express from 'express';

import authController from '../controllers/auth.controller';
import userController from '../controllers/user.controller';
import { 
    isEmail,
    normalizeString,
} from '../utils';
import { wrap } from '../middleware';
import {
    BadRequestError,
    LoginError,
} from '../errors';

export default function(app: express$Application) {
    const authRouter = express.Router();

    const registerUser = async (req: $Request, res: $Response) => {
        const email = normalizeString(req.body.email);
        const password = normalizeString(req.body.password);
        const privilege = normalizeString(req.body.privilege);

        if (!isEmail(email) || !password) {
            throw new BadRequestError('You must supply a valid email and password');
        }

        const user = await authController.createUser({
            email,
            password,
            privilege: 'user',
        });

        res.json({
            success: true,
            user,
        });
    };

    const loginUser = async (req: $Request, res: $Response) => {
        const email = normalizeString(req.body.email);
        const password = normalizeString(req.body.password);

        if (!email || !isEmail(email) || !password) {
            throw new BadRequestError('You must supply a valid email and password');
        } else {
            let user = await userController.getUserByEmail(email);

            if (user) {
                let verifiedUser = await authController.verifyUser(user, password);

                if (verifiedUser) {
                    const tokenPair = await authController.checkToken(verifiedUser);

                    if (tokenPair) {
                        let userRet = tokenPair.user.toJSON();
                        userRet.token = tokenPair.token.toJSON();

                        return res.json({
                            user: userRet,
                        });
                    }
                }
            }
        }

        throw new LoginError();
    }

    authRouter.post('/register', wrap(registerUser));
    authRouter.post('/login', wrap(loginUser));
    app.use('/auth', authRouter);
}