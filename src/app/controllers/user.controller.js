// @flow

import Sequelize from 'sequelize';
import models from '../models';
import { to } from '../utils';

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
}

/** 
 * Finds one User instance with a matching email and id combination
 * @param   {number}    pageNumber - the # that corresponds to a subset of Users
 * @param   {number}         limit - the # of users per page      
 * @returns {Promise<Array<User>>} - returns Promise containing an
 * array of User instances; returns null if does not exist
 */
const getUserByIdAndEmail = async function(id: number, email: string): Promise<models.User> {
    return models.User.findOne({
        where: {
            email,
            id
        }
    });
};

/** 
 * Finds one User instance that matches the given email
 * @param   {email}   email - an email to match
 * @returns {Promise<User>} - returns Promise containing a User 
 * instance with the given email; returns null if does not exist
 */
const getUserByEmail = async function(email: string): Promise<models.User> {
    return models.User.findOne({ 
        where: { email }
    });
};

/** 
 * Finds one User instances that matches the given id
 * @param   {number}     id - an id to match
 * @returns {Promise<User>} - returns Promise containing a User 
 * instance with the given id; returns null if does not exist
 */
const getUserById = async function(id: number): Promise<models.User> {
    return models.User.findOne({ 
        where: { id },
        include: [{
          model: models.Token
        }]
    });
}

export default {
    getUsers,
    getUserByIdAndEmail,
    getUserByEmail,
    getUserById
};