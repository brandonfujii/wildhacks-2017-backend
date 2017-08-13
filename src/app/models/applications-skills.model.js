// @flow

import Sequelize from 'sequelize';
import models from '../models';

export default function(
            sequelize: Sequelize, 
            DataTypes: Sequelize.DataTypes): Sequelize.Model {

    const { INTEGER } = DataTypes;

    const ApplicationSkill = sequelize.define('ApplicationSkill', {
        application_id: {
            type: INTEGER,
            onDelete: 'CASCADE',
            allowNull: false,
            references: {
                model: 'applications',
                key: 'id'
            }
        },
        skill_id: {
            type: INTEGER,
            onDelete: 'CASCADE',
            allowNull: false,
            references: {
                model: 'skills',
                key: 'id'
            }
        },
    }, {
        timestamps: true,
        underscored: true,
        tableName: 'applications_skills',
    });

    return ApplicationSkill;
};