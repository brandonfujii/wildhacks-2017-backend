// @flow

import models from '../models';

const getEvents = async function(pageNumber: number = 1, limit: number = 10): Promise<Object> {
    const offset = pageNumber < 1 ? 0 : --pageNumber * limit;

    return models.Event.findAll({
        limit,
        offset
    });
};

const getEventById = async function(eventId: number): Promise<?models.Event> {
    return models.Event.findOne({
        where: {
            id: eventId,
        },
        include: [{
            model: models.User, 
        }]
    });
};

export default {
    getEvents,
    getEventById,
};
