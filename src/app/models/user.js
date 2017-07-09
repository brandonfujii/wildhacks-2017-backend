// @flow

import bcrypt from 'bcryptjs';
import Sequelize from 'sequelize';

const NUM_SALTS = 12;

export default function(
            sequelize: Sequelize, 
            DataTypes: Sequelize.DataTypes): Sequelize {

    const {
        STRING,
        ENUM
    } = DataTypes;

    const User = sequelize.define('user', {
        firstName: {
            type: STRING
        },
        lastName: {
            type: STRING
        },
        email: {
            type: STRING,
            validate: {
                isEmail: true,
                notNull: true
            }
        },
        password: {
            type: STRING,
            validate: {
                notNull: true
            }
        },
        privilege: {
            type: ENUM,
            values: ['admin', 'user']
        }
    }, {
        timestamps: true,
        tableName: 'users'
    });

    function hashPassword(password: string): Promise<any> {
        return bcrypt.genSaltAsync(NUM_SALTS)
            .then(function(salt) {
                return bcrypt.hashAsync(password, salt, null);
            });
    }

    User.beforeCreate(function(user, options) {
        return hashPassword(user.password)
            .then(function(hash) {
                user.password = hash;
            });
    });

    return User;
};