// @flow

import models from '../models';
import debug from 'debug';

const User = models.user;
const log = debug('api:controller:user');

function createUser(userOptions: Object): Promise<models.user | null> {
    let {
        firstName,
        lastName,
        email,
        password,
        privilege
    } = userOptions;

    if (email && password) {
        console.log(email, password);
        return User
            .create({
                email,
                password
            })
            .then(function(user) {
                return user;
            })
            .catch(function(err) {
                console.error("Cannot create user", err);
            });
    }

    return Promise.resolve(null);

}

export default {
    createUser
};