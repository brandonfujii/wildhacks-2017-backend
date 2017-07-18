// @flow

import Sequelize from 'sequelize';
import models from '../models';
import { to } from '../utils';

const userAttributes = {
    exclude: ['password']
};

const getUsers = async function(pageNumber: number = 1, limit: number = 10): Promise<Object> {
    const offset = pageNumber < 1 ? 0 : --pageNumber * limit; // zero-index page number

    return models.User.findAll({
        limit,
        offset,
        attributes: userAttributes
    });
}

const getUserByIdAndEmail = async function(id: number, email: string): Promise<models.User> {
    return models.User.findOne({
        where: {
            email,
            id
        },
        attributes: userAttributes
    });
};

const getUserByEmail = async function(email: string): Promise<models.User> {
    return models.User.findOne({ 
        where: { email },
        attributes: userAttributes
    });
};

const getUserById = async function(id: number): Promise<models.User> {
    return models.User.findOne({ 
        where: { id },
        attributes: userAttributes,
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