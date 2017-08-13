// @flow

import Sequelize from 'sequelize';
import models from '../models';

export default function(
            sequelize: Sequelize, 
            DataTypes: Sequelize.DataTypes): Sequelize.Model {

    const { STRING } = DataTypes;

    const Skill = sequelize.define('Skill', {
        name: {
            type: STRING,
            allowNull: false,
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
        tableName: 'skills'
    });

    // Class Methods
    Skill.associate = function(models: Object) {
        Skill.belongsToMany(models.Application, {
            through: models.ApplicationSkill
        });
    };
    
    return Skill;
};