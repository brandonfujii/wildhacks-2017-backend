// @flow

import Sequelize from 'sequelize';
import models from '../models';

export default function(
            sequelize: Sequelize, 
            DataTypes: Sequelize.DataTypes): Sequelize.Model {

    const {
        STRING,
        INTEGER
    } = DataTypes;

    const VerificationToken = sequelize.define('VerificationToken', {
        user_id: {
            type: INTEGER,
            onDelete: 'CASCADE',
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        value: {
            type: STRING
        }
    }, {
        timestamps: true,
        underscored: true,
        tableName: 'verification_tokens',
    });

    // Class Methods
    VerificationToken.associate = function(models: Object) {
        VerificationToken.belongsTo(models.User, {
            onDelete: 'CASCADE',
        });
    };
    
    return VerificationToken;
};