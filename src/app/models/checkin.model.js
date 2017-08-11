// @flow

import Sequelize from 'sequelize';
import models from '../models';

export default function(
            sequelize: Sequelize, 
            DataTypes: Sequelize.DataTypes): Sequelize.Model {

    const { INTEGER } = DataTypes;

    const CheckIn = sequelize.define('CheckIn', {
        user_id: {
            type: INTEGER,
            onDelete: 'CASCADE',
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        event_id: {
            type: INTEGER,
            onDelete: 'CASCADE',
            allowNull: false,
            references: {
                model: 'events',
                key: 'id'
            }
        },
    }, {
        timestamps: true,
        underscored: true,
        tableName: 'check_ins',
    });

    return CheckIn;
};