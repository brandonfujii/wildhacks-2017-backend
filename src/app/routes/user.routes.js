// @flow

import express from 'express';
import userController from '../controllers/user.controller';

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

    app.use('/user', userRouter);
}