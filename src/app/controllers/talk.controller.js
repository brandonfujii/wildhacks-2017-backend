// @flow

import sequelize from 'sequelize';
import models from '../models';
import { pick, isArray } from 'lodash';
import { NotFoundError, ForbiddenError } from '../errors';

export const VALID_TALK_PROPERTIES = ['name', 'description'];

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
            {
                model: models.Tag,
            },
        ]
    });
};

const _attachTags = async function(tags: Array<models.Talk>, talkId: number): Promise<Array<models.TalkTag>> {
    const t = await models.sequelize.transaction();
    const options = { 
        ignoreDuplicates: true,
        transaction: t,
    };

    return new Promise(async (resolve, reject) => {
        try {
            const talkTags = tags.reduce((result, tag) => {
                if (!tag.id || !talkId) return result;

                result.push({
                    tag_id: tag.id,
                    talk_id: talkId,
                });

                return result;
            }, []);

            const talks = await models.TalkTag.bulkCreate(talkTags, options);
            resolve(talks);
            await t.commit();       
        } catch(err) {
            reject(err);
            await t.rollback();
        }
    });
};

const _getMetaValue = function(value: string): string {
    return value.trim().toLowerCase().replace(/[^a-zA-Z\d:]/g, '_');
};

const _createTags = async function(values: Array<string>): Promise<Array<models.Tag>> {
    const t = await models.sequelize.transaction();
    const options = {
        ignoreDuplicates: true,
        transaction: t,
    };

    return new Promise(async (resolve, reject) => {
        try {
            let metaValues = [];
            const tags = values.reduce((result, value) => {
                if (typeof value !== 'string') return result;
                
                const metaValue = _getMetaValue(value);
                if (metaValues.includes(metaValue)) return result; 
                
                metaValues.push(metaValue);
                result.push({
                    name: value,
                    meta_value: metaValue,
                });

                return result;
            }, []);
            
            await models.Tag.bulkCreate(tags, options);
            await t.commit();
            const newTags = await models.Tag.findAll({
                where: {
                    meta_value: {
                        $in: metaValues,
                    }
                },
            });

            resolve(newTags);
        } catch(err) {
            reject(err);
            await t.rollback();
        }
    });
};

const _createTalk = async function(options: Object): Promise<models.Talk> {
    const t = await models.sequelize.transaction();

    return new Promise(async (resolve, reject) => {
        try {
            const talk = await models.Talk.create(options, { transaction: t });
            resolve(talk);
            await t.commit();
        } catch(err) {
            reject(err);
            await t.rollback();
        }
    });
};

const createTalk = async function(speakerId: number, options: Object): Promise<models.Talk> {
    const t =  await models.sequelize.transaction();
    
    return new Promise(async (resolve, reject) => {
        try {
            const props = pick(options, VALID_TALK_PROPERTIES);
            let talk;
            let tags = [];

            if (!isArray(options.tags) || options.tags.length < 1) {
                talk = await _createTalk({
                    speaker_id: speakerId,
                    ...props,
                }, t);
            } else {
                const [newTalk, newTags] = await Promise.all([
                   _createTalk({
                       speaker_id: speakerId,
                       ...props,
                   }),
                   _createTags(options.tags)
                ]);
                talk = newTalk;
                tags = newTags;
                await _attachTags(tags, talk.id);
            }
            
            resolve({
                talk: {
                    ...talk.toJSON(),
                    tags,
                },
            });
            await t.commit();
        } catch(err) {
            reject(err);
            await t.rollback();
        }
    });
};

const _updateTags = async function(talk: models.Talk, updatedTags: Array<string>): Promise<Array<models.Tag>> {
    const t = await models.sequelize.transaction();

    return new Promise(async (resolve, reject) => {
        try {
            if (talk.Tags.length > 1) {
                let tags = {}
                for (let i = 0, len = talk.Tags.length; i < len; ++i) {
                    tags[talk.Tags[i].id] = talk.Tags[i];
                }

                const talksTags = await models.TalkTag.findAll({
                    where: {
                        talk_id: talk.id,
                        tag_id: {
                            $in: Object.keys(tags),
                        }
                    }
                });
                
                const updatedTagValues = updatedTags.map(tag => _getMetaValue(tag));
                const tagAssociationsToBeRemoved = talksTags.reduce((result, talkTag) => {
                    const val = tags[talkTag.tag_id].meta_value;
                    if (!updatedTagValues.includes(val) && !result.includes(val)) {
                        result.push(talkTag.tag_id);
                    }

                    return result;
                }, []);

                models.TalkTag.destroy({
                    where: {
                        talk_id: talk.id,
                        tag_id: {
                            $in: tagAssociationsToBeRemoved,
                        }
                    }
                }, { transaction: t });
            }

            await t.commit();            
            const createdTags = await _createTags(updatedTags);
            resolve(createdTags);
        } catch(err) {
            reject(err);
            await t.rollback();
        }
    });
};

const updateTalk = async function(talkId: number, speakerId: number, updatedAttrs: Object): Promise<models.Talk> {
    return new Promise(async (resolve, reject) => {
        const t = await models.sequelize.transaction();

        try {
            let existingTalk = await getTalkById(talkId);

            if (existingTalk) {
                if (existingTalk.speaker_id === speakerId) {
                    const props = pick(updatedAttrs, VALID_TALK_PROPERTIES);
                    let talk;
                    let tags = [];

                    if (!isArray(updatedAttrs.tags) || updatedAttrs.tags.length < 1) {
                        talk = await existingTalk.update(
                            props, {
                            transaction: t,
                        });
                    } else {
                        const [updatedTalk, updatedTags] = await Promise.all([
                            existingTalk.update(
                                props, {
                                transaction: t,
                            }),
                            _updateTags(existingTalk, updatedAttrs.tags),
                        ]);
                        talk = updatedTalk;
                        tags = updatedTags;
                        await _attachTags(tags, talk.id);
                    }

                    resolve({
                        ...talk.toJSON(),
                        tags,
                    });
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
