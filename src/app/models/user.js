// @flow

import bcrypt from 'bcryptjs';
import Sequelize from 'sequelize';

export default function(
            sequelize: Sequelize, 
            DataTypes: Sequelize.DataTypes): Sequelize.Model {

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
                isEmail: true
            },
            unique: {
                args: true,
                msg: 'Email must be unique'
            }
        },
        password: {
            type: STRING
        },
        privilege: {
            type: ENUM,
            values: ['admin', 'user'],
            defaultValue: 'user'
        }
    }, {
        timestamps: true,
        tableName: 'users',
        indexes: [{ unique: true, fields: ['email'] }]
    });

    User.prototype.verifyPassword = async function(candidatePassword: string): Promise<boolean> {
        return bcrypt.compare(candidatePassword, this.hash, (err, isMatch) => {
            if (err) {
                throw new Error(err);
            }
            return isMatch;
        });
    };

    const _createSalt = async function(numSalts: number = 10): Promise<string> {
        return new Promise((resolve, reject) => {
            bcrypt.genSalt(numSalts, (err, salt) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(salt);
                }
            }); 
        }); 
    }

    const _createHash = async function(password: string, salt: string): Promise<string> {
        return new Promise((resolve, reject) => {
            bcrypt.hash(password, salt, (err, hash) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(hash);
                }
            });
        })
    }

    const hashPassword = async function(password: string): Promise<string> {
        return _createSalt() 
            .then(salt => {
                return _createHash(password, salt);
            })
            .catch(err => {
                console.error(err);
            });
    }

    User.beforeCreate(async function(user: User, options: User.options): Promise<void> {
        let hash = await hashPassword(user.password);

        if (hash) {
            user.password = hash;
        } else {
            throw new Error('Unable to create user');
            // todo: create custom validation error
        }
    });

    return User;
};