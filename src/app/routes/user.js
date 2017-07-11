// @flow

import express from 'express';
import userController from '../controllers/user.controller';

export default function(app: express$Application): void {
    app.post('/user/create', function(req: $Request, res: $Response) {
        const {
            email,
            password
        } = req.body;

        console.log(email, password);
        let hello = userController
            .createUser({ email, password });

        res.json({ hello });
    });
}