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

    const Mentor = sequelize.define('Mentor',
        userAttributes(DataTypes),
        userMixins('mentors'));

    return attachMethods(Mentor);
};