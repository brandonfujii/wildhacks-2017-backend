// @flow

import _ from 'lodash';
import models from '../models';
import { 
    NotFoundError,
    ForbiddenError,
} from '../errors';

const getTalks = async function(pageNumber: number = 1, limit: number = 10): Promise<Object> {
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
        include: [{
            model: models.User, 
        }]
    });
};

const createTalk = async function(userId: number, name: string, description: string): Promise<models.Talk> {
    return new Promise(async (resolve, reject) => {
        const t =  await models.sequelize.transaction();

        try {
            const talk = await models.Talk.create({
                name, 
                description,
                user_id: userId,
            }, { transaction: t, });

            resolve(talk);
            await t.commit();
        } catch(err) {
            reject(err);
            await t.rollback();
        }
    });
};

const updateTalk = async function(talkId: number, requesterId: number, updatedAttrs: Object): Promise<models.Talk> {
    return new Promise(async (resolve, reject) => {
        const t = await models.sequelize.transaction();

        try {
            let existingTalk = await getTalkById(talkId);

            if (existingTalk) {
                if (existingTalk.user_id === requesterId) {
                    const mutableProps = ['name', 'description'];
                    const updatedTalk = await existingTalk.update(
                        _.pick(updatedAttrs, mutableProps), {
                        transaction: t,
                    });

                    resolve(updatedTalk);
                    await t.commit();
                } else {
                    reject(new ForbiddenError());
                }

            } else {
                reject(new NotFoundError('The requested talk was not found'));
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
};
