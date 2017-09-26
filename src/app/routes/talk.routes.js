// @flow

import express from 'express';

import talkController from '../controllers/talk.controller';
import { wrap, authMiddleware } from '../middleware';
import { normalizeString } from '../utils';
import { 
    BadRequestError,
    NotFoundError,
    UnauthorizedError,
} from '../errors';

const TALK_NAME_CHAR_LIMIT = 50;
const TALK_DESCRIPTION_CHAR_LIMIT = 500;

export default function(app: express$Application) {
    const talkRouter = express.Router();

    const getTalkPage = async (req: $Request, res: $Response) => {
        let pageNumber = parseInt(req.query.page);
        const limit = parseInt(req.query.limit) 
                ? parseInt(req.query.limit)
                : undefined;
        const order = normalizeString(req.query.order);
        const requester = req.requester;

        if (!requester || !requester.id) {
            throw UnauthorizedError('You cannot access talks without being signed in');
        }

        if (!pageNumber || pageNumber < 1) pageNumber = 1;

        const [talks, count] = await Promise.all([
            talkController.getTalks(pageNumber, limit, order, requester.id),
            talkController.getCount(),
        ]);
    
        res.json({
            count,
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

        res.json({ talk });
    };

    const createTalk = async (req: $Request, res: $Response) => {
        const name = req.body.name,
            description = req.body.description,
            tags = req.body.tags,
            speaker = req.requester;

        console.log(description.length);

        if (!speaker || !speaker.id) {
            throw new UnauthorizedError('You cannot create a talk without being signed in');
        }

        if (typeof name !== 'string' && name.length > TALK_NAME_CHAR_LIMIT) {
            throw new BadRequestError('Must provide a valid name string under 50 characters');
        }

        if (typeof description !== 'string' || description.length > TALK_DESCRIPTION_CHAR_LIMIT) {
            throw new BadRequestError('Must provide a valid description string under 500 characters');
        }

        const talk = await talkController.createTalk(speaker.id, {
            name,
            description,
            tags,
        });

        res.json({ talk });
    };

    const deleteTalk = async (req: $Request, res: $Response) => {
        const talkId = parseInt(req.params.id);
        const speaker = req.requester;

        if (!speaker || !speaker.id) {
            throw new UnauthorizedError('You cannot delete a talk without being signed in');
        }

        if (!talkId) {
            throw new BadRequestError('Must provide valid talk id');
        }

        const result = await talkController.deleteTalk(talkId, speaker.id);

        res.json(result);
    };

    const updateTalk = async (req: $Request, res: $Response) => {
        const talkId = parseInt(req.params.id);
        const options = req.body;
        const speaker = req.requester;

        if (!speaker || !speaker.id) {
            throw new UnauthorizedError('You cannot update a talk without being signed in');
        }

        if (!talkId) {
            throw new BadRequestError('Must provide valid talk id');
        }

        const talk = await talkController.updateTalk(talkId, speaker.id, options);

        res.json({ talk });
    };

    const upvoteTalk = async (req: $Request, res: $Response) => {
        const talkId = parseInt(req.params.id);
        const requester = req.requester;

        if (!requester || !requester.id) {
            throw new UnauthorizedError('You cannot upvote a talk without being signed in');
        }

        if (!talkId) {
            throw new BadRequestError('Must provide valid talk id');
        }

        const talk = await talkController.upvoteTalk(talkId, requester.id);
        res.json({ talk });
    };

    const downvoteTalk = async (req: $Request, res: $Response) => {
        const talkId = parseInt(req.params.id);
        const requester = req.requester;

        if (!requester || !requester.id) {
            throw new UnauthorizedError('You cannot downvote a talk without being signed in');
        }

        if (!talkId) {
            throw new BadRequestError('Must provide valid talk id');
        }

        const result = await talkController.downvoteTalk(talkId, requester.id);
        res.json(result);
    };

    talkRouter.use(authMiddleware);
    talkRouter.get('/', wrap(getTalkById));
    talkRouter.get('/all', wrap(getTalkPage));
    talkRouter.post('/create', wrap(createTalk));
    talkRouter.put('/:id', wrap(updateTalk));
    talkRouter.delete('/:id', wrap(deleteTalk));
    talkRouter.put('/:id/upvote', wrap(upvoteTalk));
    talkRouter.delete('/:id/upvote', wrap(downvoteTalk));
    app.use('/talk', talkRouter);
}