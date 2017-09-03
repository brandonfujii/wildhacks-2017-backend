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

    const RecoveryToken = sequelize.define('RecoveryToken', {
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
        tableName: 'recovery_tokens',
    });

    // Class Methods
    RecoveryToken.associate = function(models: Object) {
        RecoveryToken.belongsTo(models.User, {
            onDelete: 'CASCADE',
        });
    };
    
    return RecoveryToken;
};