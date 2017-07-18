// @flow

import models from '../models';

const getTokenByUserId= async function(userId: number): Promise<models.User> {
    return models.Token.findOne({
        where: {
            user_id: userId
        }
    });
}

export default {
    getTokenByUserId
}