// @flow

import models from '../models';

function createUser(userOptions: Object): string {
    let {
        firstName,
        lastName,
        email,
        password,
        privilege
    } = userOptions;

    if (email && password) {
        return "Hello";
    }

}

export default {
    createUser
};