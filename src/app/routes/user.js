// @flow

import express from 'express';
import userController from '../controllers/user_controller';

export default function(app: express$Application): void {
    app.post('/user/create', function(req: $Request, res: $Response) {
        const {
            email,
            password
        } = req.body;

        console.log(email, password);
        userController
            .createUser({ email, password });
    });
}