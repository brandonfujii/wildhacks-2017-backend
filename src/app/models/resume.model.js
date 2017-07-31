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

    const Resume = sequelize.define('Resume', {
        user_id: {
            type: INTEGER,
            onDelete: 'CASCADE',
            allowNull: false,
            references: {
                model: 'applications',
                key: 'id'
            }
        },
        filename: {
            type: STRING,
        },
    }, {
        timestamps: true,
        underscored: true,
        tableName: 'resumes'
    });

    // Class Methods
    Resume.associate = function(models: Object) {
        Resume.belongsTo(models.Application, {
            onDelete: 'CASCADE',
        });
    };
    
    return Resume;
};