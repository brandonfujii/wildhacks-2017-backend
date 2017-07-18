// @flow

import models from '../models';

const getTokenByUserId= async function(userId: number): Promise<models.User> {
    console.log("userid", userId);
    return models.Token.findOne({
        where: {
            user_id: userId
        }
    });
}

export default {
    getTokenByUserId
}