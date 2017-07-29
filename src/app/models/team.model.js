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

    const Team = sequelize.define('Team', {
        name: {
            type: STRING,
            allowNull: false,
        },
    }, {
        timestamps: true,
        underscored: true,
        tableName: 'teams'
    });

    // Class Methods
    Team.associate = function(models: Object) {
        Team.hasMany(models.User);
    };
    
    return Team;
};