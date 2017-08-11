// @flow

import express from 'express';

import talkController from '../controllers/talk.controller';
import { wrap } from '../middleware';
import { normalizeString } from '../utils';
import { 
    BadRequestError,
    NotFoundError,
} from '../errors';

export const TALK_NAME_CHAR_LIMIT = 50;
export const TALK_DESCRIPTION_CHAR_LIMIT = 300;

export default function(app: express$Application) {
    const talkRouter = express.Router();

    const getTalkPage = async (req: $Request, res: $Response) => {
        const pageNumber = parseInt(req.query.page),
            limit = parseInt(req.query.limit) 
                ? parseInt(req.query.limit)
                : undefined;

        if (!pageNumber || pageNumber < 1) {
            throw new BadRequestError('Please supply a valid integer page number greater than 1');
        }

        const talks = await talkController.getTalks(pageNumber, limit);
    
        res.json({ 
            page: pageNumber,
            talks: talks ? talks : [],
        });
    };

    const getTalkById = async (req: $Request, res: $Response) => {
        const talkId = parseInt(req.query.id);

        if (!talkId) {
            throw new BadRequestError('Must provide a talk id');
        }

        const talk = await talkController.getTalkById(talkId);

        if (talk) {
            res.json({
                talk,
            });
        } else {
            throw new NotFoundError('Talk was not found');
        }
    };

    const createTalk = async (req: $Request, res: $Response) => {
        const userId = parseInt(req.body.user_id),
            name = req.body.name,
            description = req.body.description; 

        if (!userId) {
            throw new BadRequestError('Must provide valid user id');
        }

        if (typeof name !== 'string' && name.length > TALK_NAME_CHAR_LIMIT) {
            throw new BadRequestError('Must provide a valid name string under 50 characters');
        }

        if (typeof description !== 'string' || description.length > TALK_DESCRIPTION_CHAR_LIMIT) {
            throw new BadRequestError('Must provide a valid description string under 300 characters');
        }

        const talk = await talkController.createTalk(userId, name, description);

        res.json({
            talk,
        });
    };

    talkRouter.get('/', wrap(getTalkById));
    talkRouter.get('/all', wrap(getTalkPage));
    talkRouter.post('/create', wrap(createTalk));
    app.use('/talk', talkRouter);
}