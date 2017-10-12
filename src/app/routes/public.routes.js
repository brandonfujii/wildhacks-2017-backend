// @flow

import express from 'express';

import publicController from '../controllers/public.controller';
import { wrap } from '../middleware';
import { BadRequestError } from '../errors';

export default function(app: express$Application) {
    const publicRouter = express.Router();

    const getUsers = async (req: $Request, res: $Response) => {
        let pageNumber = parseInt(req.query.page),
            limit = parseInt(req.query.limit) ? parseInt(req.query.limit) : undefined;

        if (!pageNumber || pageNumber < 1) pageNumber = 1;

        const result = await publicController.getUsers(pageNumber, limit);
        res.json(result);
    };

    const getTeams = async (req: $Request, res: $Response) => {
        let pageNumber = parseInt(req.query.page),
            limit = parseInt(req.query.limit) ? parseInt(req.query.limit) : undefined;

        if (!pageNumber || pageNumber < 1) pageNumber = 1;

        const result = await publicController.getTeams(pageNumber, limit);
        res.json(result);
    };

    const getEvents = async (req: $Request, res: $Response) => {
        let pageNumber = parseInt(req.query.page),
            limit = parseInt(req.query.limit) ? parseInt(req.query.limit) : undefined;

        if (!pageNumber || pageNumber < 1) pageNumber = 1;

        const result = await publicController.getEvents(pageNumber, limit);
        res.json(result);
    };

    const getTalks = async (req: $Request, res: $Response) => {
        let pageNumber = parseInt(req.query.page),
            limit = parseInt(req.query.limit) ? parseInt(req.query.limit) : undefined;

        if (!pageNumber || pageNumber < 1) pageNumber = 1;

        const result = await publicController.getTalks(pageNumber, limit);
        res.json(result);    
    };

    publicRouter.get('/users', wrap(getUsers));
    publicRouter.get('/teams', wrap(getTeams));
    publicRouter.get('/events', wrap(getEvents));
    publicRouter.get('/talks', wrap(getTalks));
    app.use('/public', publicRouter)
}
