// @flow

import jwt from 'jsonwebtoken';
import config from 'config'
import models from '../models';

import {
    TokenExpirationError
} from '../errors';

/** 
 * Finds a token based on user id
 * @param   {number} userId - a foreign user id key that corresponds
 * to the token's owner
 * @returns {Promise<Token>} - returns the owner of the token; if
 * owner does not exist, returns null
 */
const getTokenByUserId = async function(userId: number): Promise<?models.Token> {
    return models.Token.findOne({
        where: {
            user_id: userId
        }
    });
}

/** 
 * Finds a token instance based on its token value
 * @param   {number}   value - a token string value
 * @returns {Promise<Token>} - returns the owner of the token; if
 * owner does not exist, returns null
 */
const getTokenByValue = async function(value: string): Promise<?models.Token> {
    return models.Token.findOne({
        where: {
            value
        }
    });
}

const verifyToken = async function(token: models.Token): Promise<Object> {
    return new Promise((resolve, reject) => {
        return jwt.verify(token.value, config.get('auth.secret'), (err, decoded) => {
            if (err) {
                if (err instanceof jwt.TokenExpiredError) {
                    token.destroy({ force: true });

                    reject(new TokenExpirationError());
                }

                reject(err);
            }
            
            resolve(decoded);
        });
    });
}

export default {
    getTokenByUserId,
    getTokenByValue,
    verifyToken,
};