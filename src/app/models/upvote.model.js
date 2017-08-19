// @flow

import Sequelize from 'sequelize';
import models from '../models';

export default function(
            sequelize: Sequelize, 
            DataTypes: Sequelize.DataTypes): Sequelize.Model {

    const { INTEGER } = DataTypes;

    const Upvote = sequelize.define('Upvote', {
        user_id: {
            type: INTEGER,
            onDelete: 'CASCADE',
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        talk_id: {
            type: INTEGER,
            onDelete: 'CASCADE',
            allowNull: false,
            references: {
                model: 'talks',
                key: 'id'
            }
        },
    }, {
        timestamps: true,
        underscored: true,
        tableName: 'upvotes',
    });

    return Upvote;
};