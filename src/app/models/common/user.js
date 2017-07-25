// @flow

import bcrypt from 'bcryptjs';
import Sequelize from 'sequelize';

import {
    InternalServerError
} from '../../errors';

export const userAttributes = function(DataTypes: Sequelize.DataTypes): Object {
    const {
        STRING,
        ENUM,
        INTEGER
    } = DataTypes;

    return {
        first_name: {
            type: STRING,
            validate: {
                isAlpha: true
            }
        },
        last_name: {
            type: STRING,
            validate: {
                isAlpha: true
            }
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
            defaultValue: 'user',
            validate: {
                isIn: {
                    args: [['admin', 'user']],
                    msg: 'Must be a valid privilege'
                },
            },
        },
        token_id: {
            type: INTEGER
        },
    };
};

export const userMixins = function(tableName: string): Object {
    return {
        timestamps: true,
        underscored: true,
        indexes: [{ unique: true, fields: ['email'] }],
        tableName,
    };
};

export const attachMethods = function(Model: Sequelize.Model): Sequelize.Model {
    // Class Methods
    Model.associate = function(models: Object) {
        Model.hasOne(models.Token);
    }

    // Instance Methods
    Model.prototype.verifyPassword = async function(candidatePassword: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            return bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(isMatch);
                }
            });
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

    // Hooks
    Model.beforeCreate(async function(model: Model, options: Model.options): Promise<void> {
        let hash = await hashPassword(model.password);

        if (hash) {
            model.password = hash;
        } else {
            throw new InternalServerError('Unable to create user right now. Please try again later');
        }
    });

    return Model;
};