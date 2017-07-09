// @flow

import bcrypt from 'bcryptjs';
import Sequelize from 'sequelize';

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
            allowNull: false,
            validate: {
                isEmail: true,
            }
        },
        password: {
            type: STRING
        },
        privilege: {
            type: ENUM,
            values: ['admin', 'user']
        }
    }, {
        timestamps: true,
        tableName: 'users'
    });

    const DEFAULT_NUM_SALTS = 10;

    function _genSalt(password: string, numSalts: number): Promise<Object> {
        return new Promise(function(resolve, reject) {
            bcrypt.genSalt(numSalts || DEFAULT_NUM_SALTS, function(err, salt) {
                if (err) {
                    reject(err);
                } else {
                    resolve({
                        salt,
                        password
                    });
                }
            }); 
        }); 
    }

    function _genHash(password: string, salt: string): Promise<Object> {
        return new Promise(function(resolve, reject) {
            bcrypt.hash(password, salt, null, function(err, hash) {
                if (err) {
                    reject(err);
                } else {
                    resolve({
                        salt,
                        password,
                        hash
                    });
                }
            });
        })
    }

    function hashPassword(password: string): Promise<Object> {
        return _genSalt(password, DEFAULT_NUM_SALTS) 
            .then(function(result) {
                const {
                    salt,
                    password
                } = result;

                return _genHash(password, salt);
            })
            .catch(function(err) {
                console.error(err);
            });
    }

    User.beforeCreate(function(user, options) {
        return hashPassword(user.password)
            .then(function(hash) {
                console.log(hash);
                user.password = hash;
            })
            .catch(function(err) {
                console.error(err);
            });
    });

    return User;
};