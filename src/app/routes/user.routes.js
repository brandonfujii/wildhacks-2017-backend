// @flow

import express from 'express';

import userController from '../controllers/user.controller';
import { normalizeString, isEmail } from '../utils';
import { wrap, authMiddleware, adminMiddleware } from '../middleware';
import { BadRequestError, NotFoundError } from '../errors';

export default function(app: express$Application) {
    const userRouter = express.Router();

    const getUserPage = async (req: $Request, res: $Response) => {
        let pageNumber = parseInt(req.query.page),
            limit = parseInt(req.query.limit) ? parseInt(req.query.limit) : undefined;

        if (!pageNumber || pageNumber < 1) pageNumber = 1;

        const userPage = await userController.getUserPage(pageNumber, limit);
        res.json(userPage);
    };

    const getUserDataPage = async (req: $Request, res: $Response) => {
        let pageNumber = parseInt(req.query.page),
            limit = parseInt(req.query.limit) ? parseInt(req.query.limit) : undefined;

        if (!pageNumber || pageNumber < 1) pageNumber = 1;

        const userPage = await userController.getUserDataPage(pageNumber, limit);
        res.json(userPage);
    };

    const getSingleUser = async (req: $Request, res: $Response) => {
        const email = normalizeString(req.query.email);
        const userId = parseInt(req.query.id);
        let user = null;

        if (email && userId) {
            user = await userController.getUserByIdAndEmail(userId, email);
        } else {
            if (!email && !userId) {
                throw new BadRequestError('Please supply either a valid email or id parameter');
            }

            if (email) {
                user = await userController.getUserByEmail(email);
            }

            if (userId) {
                user = await userController.getUserById(userId);
            }
        }

        res.json({ user });
    };

    const deleteUserById = async (req: $Request, res: $Response) => {
        const userId = parseInt(req.params.id);

        if (!userId) {
            throw new BadRequestError('You must supply a valid user id');
        }

        const result = await userController.deleteUserById(userId);
        res.json(result);
    };

    const checkUserIntoEvent = async (req: $Request, res: $Response) => {
        const userId = parseInt(req.body.user_id);
        const eventId = parseInt(req.body.event_id);

        if (!userId) {
            throw new BadRequestError('You must supply a valid user id');
        }

        if (!eventId) {
            throw new BadRequestError('You must supply a valid event id');
        }

        const result = await userController.checkInToEvent(eventId, userId);
        res.json(result);
    };

    userRouter.get('/info/all', adminMiddleware, wrap(getUserDataPage));
    userRouter.post('/check-in', adminMiddleware, wrap(checkUserIntoEvent))
    userRouter.delete('/:id', adminMiddleware, wrap(deleteUserById));
    userRouter.use(authMiddleware);
    userRouter.get('/', wrap(getSingleUser));
    userRouter.get('/all', wrap(getUserPage));

    app.use('/user', userRouter);
}
