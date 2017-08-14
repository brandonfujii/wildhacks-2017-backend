// @flow

import express from 'express';

import eventController from '../controllers/event.controller';

import { authMiddleware, wrap } from '../middleware';
import {
    BadRequestError,
    NotFoundError,
} from '../errors';

export default function(app: express$Application) {
    const eventRouter = express.Router();

    const getEventPage = async (req: $Request, res: $Response) => {
        const events = await eventController.getEvents();
    
        res.json({ 
            events: events ? events : [],
        });
    };

    const getEventById = async (req: $Request, res: $Response) => {
        const eventId = parseInt(req.query.id);
        const event = await eventController.getEventById(eventId);

        if (event) {
            res.json({
                event,
            });

        } else {
            throw new NotFoundError('The requested event does not exist');
        }
    };

    eventRouter.use(authMiddleware);
    eventRouter.get('/', wrap(getEventById));
    eventRouter.get('/all', wrap(getEventPage));

    app.use('/event', eventRouter);
};