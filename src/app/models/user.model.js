// @flow

import Sequelize from 'sequelize';

import { 
    userAttributes,
    userMixins,
    attachMethods,
} from './common/user';

export default function(
            sequelize: Sequelize, 
            DataTypes: Sequelize.DataTypes): Sequelize.Model {

    const {
        STRING,
    } = DataTypes;

    const User = sequelize.define('User',
        Object.assign(userAttributes(DataTypes), {
            school: {
                type: STRING,
                allowNull: true,
            },
        }),
        userMixins('users'));

    return attachMethods(User);
};