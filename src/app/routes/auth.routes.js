// @flow

import express from 'express';
import authController from '../controllers/auth.controller';
import utils from '../utils';

export default function(app: express$Application) {
    let authRouter = express.Router();

    authRouter.post('/login', async (req: $Request, res: $Response) => {
        const {
            email,
            password
        } = req.body;

        if (typeof email === 'string' &&
            typeof password === 'string' &&
            utils.isEmail(email)) {

            
        } else {
            res.status(500).json('Provide a valid email and \
                password combination');
        }
    });

    app.use('/auth', authRouter);
}