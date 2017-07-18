// @flow

import Sequelize from 'sequelize';
import models from '../models';
import { to } from '../utils';

const getUsers = async function(pageNumber: number = 1, limit: number = 10): Promise<Object> {
    const offset = pageNumber < 1 ? 0 : --pageNumber * limit; // zero-index page number

    return models.User.findAll({
        limit,
        offset
    });
}

const getUserByIdAndEmail = async function(id: number, email: string): Promise<models.User> {
    return models.User.findOne({
        where: {
            email,
            id
        }
    });
};

const getUserByEmail = async function(email: string): Promise<models.User> {
    return models.User.findOne({ 
        where: { email }
    });
};

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