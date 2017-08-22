// @flow

import express from 'express';

import publicController from '../controllers/public.controller';
import { wrap } from '../middleware';
import { BadRequestError } from '../errors';

export default function(app: express$Application) {
    const publicRouter = express.Router();

    const getUserPage = async (req: $Request, res: $Response) => {
        let pageNumber = parseInt(req.query.page),
            limit = parseInt(req.query.limit) ? parseInt(req.query.limit) : undefined;

        if (!pageNumber || pageNumber < 1) pageNumber = 1;

        const userPage = await publicController.getUserPage(pageNumber, limit);

        res.json(userPage);
    };

    publicRouter.get('/users', wrap(getUserPage));
    app.use('/public', publicRouter)
}
