// @flow

import Sequelize from 'sequelize';
import models from '../models';

export default function(
            sequelize: Sequelize, 
            DataTypes: Sequelize.DataTypes): Sequelize.Model {

    const { INTEGER } = DataTypes;

    const TalkTag = sequelize.define('TalkTag', {
        talk_id: {
            type: INTEGER,
            onDelete: 'CASCADE',
            allowNull: false,
            references: {
                model: 'applications',
                key: 'id'
            }
        },
        tag_id: {
            type: INTEGER,
            onDelete: 'CASCADE',
            allowNull: false,
            references: {
                model: 'tags',
                key: 'id'
            }
        },
    }, {
        timestamps: true,
        underscored: true,
        indexes: [{ unique: true, fields: ['talk_id', 'tag_id'] }],
        tableName: 'talks_tags',
    });

    return TalkTag;
};