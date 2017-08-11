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

    const Talk = sequelize.define('Talk', {
        user_id: {
            type: INTEGER,
            onDelete: 'CASCADE',
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        name: {
            type: STRING,
            allowNull: false,
        },
        description: {
            type: STRING,
            allowNull: false,
        },
        upvotes: {
            type: INTEGER,
            defaultValue: 0,
        },
    }, {
        timestamps: true,
        underscored: true,
        tableName: 'talks'
    });

    // Class Methods
    Talk.associate = function(models: Object) {
        Talk.belongsTo(models.User);
    };

    return Talk;
};