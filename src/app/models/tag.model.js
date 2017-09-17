// @flow

import Sequelize from 'sequelize';
import models from '../models';

export default function(
            sequelize: Sequelize, 
            DataTypes: Sequelize.DataTypes): Sequelize.Model {

    const { STRING } = DataTypes;

    const Tag = sequelize.define('Tag', {
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
        tableName: 'tags'
    });

    // Class Methods
    Tag.associate = function(models: Object) {
        Tag.belongsToMany(models.Talk, {
            through: models.TalkTag
        });
    };
    
    return Tag;
};