// @flow

import express from 'express';

import authController from '../controllers/auth.controller';
import userController from '../controllers/user.controller';
import tokenController from '../controllers/token.controller';

import { wrap, authMiddleware } from '../middleware';
import { isEmail, normalizeString } from '../utils';
import { BadRequestError, LoginError, UnauthorizedError } from '../errors';

export default function(app: express$Application) {
    const authRouter = express.Router();

    const registerUser = async (req: $Request, res: $Response) => {
        const email = normalizeString(req.body.email);
        const password = normalizeString(req.body.password);

        if (!isEmail(email) || !password) {
            throw new BadRequestError('You must supply a valid email and password');
        }

        const { user, token } = await authController.createUser({
            email,
            password,
            privilege: 'user',
        });

        res.json({
            success: true,
            user,
            verificationToken: token,
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
    };

    const verifyUser = async (req: $Request, res: $Response) => {
        const verificationToken = req.params.token;
        const requester = req.requester;

        if (!requester || !requester.id) {
            throw new UnauthorizedError('You must be signed in to verify account');
        }

        const result = await authController.concludeVerification(verificationToken, requester.id);

        res.json(result);
    };

    const resendVerification = async (req: $Request, res: $Response) => {
        const requester = req.requester;

        if (!requester || !requester.id || !requester.email) {
            throw new UnauthorizedError('You must be signed in to verify account');
        }

        const token = await authController.resendVerification(requester.id, requester.email);
        
        res.json({
            token,
        });
    };

    authRouter.post('/register', wrap(registerUser));
    authRouter.post('/login', wrap(loginUser));
    authRouter.post('/verify/:token', authMiddleware, wrap(verifyUser));
    authRouter.post('/resend', authMiddleware, wrap(resendVerification));
    app.use('/auth', authRouter);
}