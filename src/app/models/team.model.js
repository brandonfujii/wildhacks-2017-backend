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

    // Instance Methods
    Team.prototype.isTeamMember = function(userId: number): boolean {
        return (this.Users || []).findIndex(user => user.id === userId) > -1;
    };

    Team.prototype.numTeamMembers = function(): number {
        return (this.Users || []).length;
    };
    
    return Team;
};
