// @flow

import models from '../models';

function createUser(userOptions: Object) {
    let {
        firstName,
        lastName,
        email,
        password,
        privilege
    } = userOptions;

    if (email && password) {
        models.User
            .findOrCreate({ 
                where: { email }
            })
            .spread(function(user, created) {
                console.log(user.get({ plain: true }));
                console.log(created);
            })
    }

}

export default {
    createUser
};