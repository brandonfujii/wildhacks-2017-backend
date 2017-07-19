// @flow

import jwt from 'jsonwebtoken';
import config from 'config'
import models from '../models';

/** 
 * Finds a token based on user id
 * @param   {number} userId - a foreign user id key that corresponds
 * to the token's owner
 * @returns {Promise<User>} - returns the owner of the token; if
 * owner does not exist, returns null
 */
const getTokenByUserId= async function(userId: number): Promise<models.User> {
    return models.Token.findOne({
        where: {
            user_id: userId
        }
    });
}

const verifyToken = async function(token: string): Promise<Object> {
    return new Promise((resolve, reject) => {
        return jwt.verify(token, config.get('auth.secret'), (err, decoded) => {
            if (err) {
                reject(err);
            }
            
            resolve(decoded);
        });
    });
}


export default {
    getTokenByUserId,
    verifyToken
};