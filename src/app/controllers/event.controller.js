// @flow

import models from '../models';

const getEvents = async function(): Promise<Array<models.Event>> {
    return models.Event.findAll();
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
