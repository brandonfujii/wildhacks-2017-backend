// @flow

import Sequelize from 'sequelize';
import models from '../models';

import EmailService from '../services/email.service';
import eventController from './event.controller';
import type { SuccessMessage } from '../types';
import { NotFoundError } from '../errors';

/** 
 * Gets a page of users based on a page number and page limit
 * @param   {number}    pageNumber - the # that corresponds to a subset of Users
 * @param   {number}         limit - the # of users per page      
 * @returns {Promise<Array<User>>} - returns Promise containing an
 * array of User instances
 */
const getUsers = async function(pageNumber: number = 1, limit: number = 10): Promise<Object> {
    const offset = pageNumber < 1 ? 0 : --pageNumber * limit; // zero-index page number

    return models.User.findAll({
        limit,
        offset
    });
};

/** 
 * Finds one User instance with a matching email and id combination
 * @param   {number}    pageNumber - the # that corresponds to a subset of Users
 * @param   {number}         limit - the # of users per page      
 * @returns {Promise<Array<User>>} - returns Promise containing an
 * array of User instances; returns null if does not exist
 */
const getUserByIdAndEmail = async function(id: number, email: string): Promise<?models.User> {
    return models.User.findOne({
        where: {
            email,
            id
        },
        include: [
            { model: models.Token },
            { model: models.Application },
            { model: models.Event },
        ]
    });
};

/** 
 * Finds one User instance that matches the given email
 * @param   {email}   email - an email to match
 * @returns {Promise<User>} - returns Promise containing a User 
 * instance with the given email; returns null if does not exist
 */
const getUserByEmail = async function(email: string): Promise<?models.User> {
    return models.User.findOne({ 
        where: { email },
        include: [
            { model: models.Token },
            { model: models.Application },
            { model: models.Event },
        ]
    });
};

/** 
 * Finds one User instances that matches the given id
 * @param   {number}     id - an id to match
 * @returns {Promise<User>} - returns Promise containing a User 
 * instance with the given id; returns null if does not exist
 */
const getUserById = async function(id: number): Promise<?models.User> {
    return models.User.findOne({ 
        where: { id },
        include: [
            { model: models.Token },
            { model: models.Application },
            { model: models.Event },
        ]
    });
};

const deleteUserById = async function(id: number): Promise<SuccessMessage> {
    return new Promise(async (resolve, reject) => {
        const user = await getUserById(id);

        if (user) {
            const t = await models.sequelize.transaction(); 

            try {
                user.destroy({ force: true }, {
                    transaction: t,
                });

                resolve({
                    success: true,
                    message: null,
                });
                await t.commit();
            } catch(err) {
                reject(err);
                await t.rollback();
            }
        } else {
            reject(new NotFoundError('User does not exist'));
        }
        
    });
};

const getCheckIn = async function(eventId: number, userId: number): Promise<?models.CheckIn> {
    return models.CheckIn.findOne({
        where: {
            event_id: eventId,
            user_id: userId,
        },
    });
};

const checkInToEvent = async function(eventId: number, userId: number): Promise<SuccessMessage> {
    return new Promise(async (resolve, reject) => {
        const t = await models.sequelize.transaction(); 

        try {
            const [user, event, existingCheckIn] = await Promise.all([
                    getUserById(userId),
                    eventController.getEventById(eventId),
                    getCheckIn(eventId, userId),
                ]);

            if (!user) {
                throw new NotFoundError('Unable to check-in because user does not exist');
            }

            if (!event) {
                throw new NotFoundError('Unable to check-in because event does not exist');
            }

            if (!existingCheckIn) {
                const checkIn = await models.CheckIn.create({
                    event_id: eventId,
                    user_id: userId,
                }, { transaction: t, });

                resolve({ 
                    success: true,
                    message: `${user.email} checked into ${event.name}!`,
                });
                await t.commit();
            }

            resolve({
                success: false,
                message: `${user.email} has already checked into ${event.name}`,
            });
        
        } catch(err) {
            reject(err);
            await t.rollback();
        }
    });
};

export default {
    getUsers,
    getUserByIdAndEmail,
    getUserByEmail,
    getUserById,
    deleteUserById,
    checkInToEvent,
};
