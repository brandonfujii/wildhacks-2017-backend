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

    const Event = sequelize.define('Event', {
        name: {
            type: STRING,
            allowNull: false,
        },
        description: {
            type: STRING,
            allowNull: true,
        },
        meta_value: {
            type: STRING,
            allowNull: false,
            unique: {
                args: true,
                msg: 'Meta value must be unique'
            },
        },
    }, {
        timestamps: true,
        underscored: true,
        indexes: [{ unique: true, fields: ['meta_value'] }],
        tableName: 'events'
    });

    // Class Methods
    Event.associate = function(models: Object) {
        Event.belongsToMany(models.User, {
            through: models.CheckIn,
        });
    };
    
    return Event;
};