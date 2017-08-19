// @flow

import _ from 'lodash';
import models from '../models';
import { NotFoundError, ForbiddenError } from '../errors';

const getTalks = async function(pageNumber: number = 1, limit: number = 10): Promise<Array<models.Talk>> {
    const offset = pageNumber < 1 ? 0 : --pageNumber * limit; // zero-index page number

    return models.Talk.findAll({
        limit,
        offset
    });
};

const getTalkById = async function(talkId: number): Promise<?models.Talk> {
    return models.Talk.findOne({
        where: {
            id: talkId,
        },
        include: [
            {
                model: models.User,
                as: 'speaker',
                attributes: ['id', 'email', 'privilege', 'type'],
            },
            {
                model: models.User,
                as: 'upvoters',
                attributes: ['id'],
            },
        ]
    });
};

const createTalk = async function(speakerId: number, name: string, description: string): Promise<models.Talk> {
    return new Promise(async (resolve, reject) => {
        const t =  await models.sequelize.transaction();

        try {
            const talk = await models.Talk.create({
                name, 
                description,
                speaker_id: speakerId,
            }, { transaction: t, });

            resolve(talk);
            await t.commit();
        } catch(err) {
            reject(err);
            await t.rollback();
        }
    });
};

const updateTalk = async function(talkId: number, userId: number, updatedAttrs: Object): Promise<models.Talk> {
    return new Promise(async (resolve, reject) => {
        const t = await models.sequelize.transaction();

        try {
            let existingTalk = await getTalkById(talkId);

            if (existingTalk) {
                if (existingTalk.user_id === userId) {
                    const mutableProps = ['name', 'description'];
                    const updatedTalk = await existingTalk.update(
                        _.pick(updatedAttrs, mutableProps), {
                        transaction: t,
                    });

                    resolve(updatedTalk);
                    await t.commit();
                } else {
                    throw new ForbiddenError('You do not have permission to update this talk');
                }

            } else {
                throw new NotFoundError('The requested talk was not found');
            }

        } catch(err) {
            reject(err);
            await t.rollback();
        }
    });
};

const getTalkUpvote = async function(upvoterId: number, talkId: number): Promise<?models.Upvote> {
    return models.Upvote.findOne({
        where: {
            user_id: upvoterId,
            talk_id: talkId,
        },
        attributes: ['id'],
    });
};

const upvoteTalk = async function(talkId: number, requester: Object): Promise<models.Talk> {
    return new Promise(async (resolve, reject) => {
        const t = await models.sequelize.transaction();

        try {
            const [talk, existingUpvote] = await Promise.all([
                    getTalkById(talkId),
                    getTalkUpvote(requester.id, talkId),
                ]);

            if (talk) {
                if (existingUpvote) {
                    resolve(talk);
                }

                const upvote = await models.Upvote.create({
                    talk_id: talk.id,
                    user_id: requester.id,
                }, { transaction: t });

                talk.upvoters.push({ 
                    id: upvote.user_id, 
                    upvote 
                });

                resolve(talk);
                await t.commit();
            } else {
                throw new NotFoundError('Unable to upvote a talk that does not exist');
            }
        } catch(err) {
            reject(err);
            await t.rollback();
        }
    });
};

export default {
    getTalks,
    getTalkById,
    createTalk,
    updateTalk,
    upvoteTalk,
};
