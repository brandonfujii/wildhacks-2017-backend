// @flow

import express from 'express';
import userController from '../controllers/user.controller';
import debug from 'debug';
import { isEmail, to } from '../utils';

const log = debug('api:user');

export default function(app: express$Application) {
    let userRouter = express.Router();

    userRouter.post('/create', async (req: $Request, res: $Response) => {
        const {
            firstName,
            lastName,
            email,
            password,
            privilege
        } = req.body;

        if (email && password) {
            let user = await userController
                                .createUser({ email, password });
            res.json({ user });
        } else {
            res.status(500).send("Blah");
        }
    });

    userRouter.get('/', async (req: $Request, res: $Response) => {
        const email = req.query.email;
        const userId = parseInt(req.query.id, 10);
        let error, user;

        if (email && userId) {
            const { err, data } = await to(userController
                                            .getUserByIdAndEmail(userId, email));
            error = err;
            user = data; 
        } else {
            if (!email && !userId) {
                res.status(500).send('Please supply either a valid email or id parameter');
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
    });

    app.use('/user', userRouter);
}