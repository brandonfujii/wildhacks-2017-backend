// @flow

import _ from 'lodash';
import Sequelize from 'sequelize';
import models from '../models';

const DEFAULT_APP_VALIDATIONS = [
    'first_name',
    'last_name',
    'age',
    'school',
    'major',
];

export default function(
            sequelize: Sequelize, 
            DataTypes: Sequelize.DataTypes): Sequelize.Model {

    const {
        STRING,
        INTEGER,
        ENUM,
    } = DataTypes;

    const Application = sequelize.define('Application', {
        user_id: {
            type: INTEGER,
            onDelete: 'CASCADE',
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        resume_id: {
            type: INTEGER
        },
        first_name: {
            type: STRING,
            validate: {
                isAlpha: true
            },
        },
        last_name: {
            type: STRING,
            validate: {
                isAlpha: true
            },
        },
        age: {
            type: INTEGER,
            allowNull: true,
        },
        ethnicity: {
            type: STRING,
            allowNull: true,
        },
        grad_year: {
            type: INTEGER,
            allowNull: true,
        },
        school: {
            type: STRING,
            allowNull: true,
        },
        major: {
            type: STRING,
            allowNull: true,
        },
        personal_website: {
            type: STRING,
            allowNull: true,
        },
        num_prev_hackathons: {
            type: INTEGER,
            allowNull: true,
        },
        github_username: {
            type: STRING,
            allowNull: true,
        },
        application_status: {
            type: ENUM,
            values: ['not_started', 'complete', 'in_progress'],
            validate: {
                isIn: {
                    args: [['not_started', 'complete', 'in_progress']],
                    msg: 'Must be a valid application status',
                },
            },
        },
    }, {
        timestamps: true,
        underscored: true,
        tableName: 'applications'
    });

    // Class Methods
    Application.associate = function(models: Object) {
        Application.belongsTo(models.User, {
            onDelete: 'CASCADE',
        });
        Application.hasOne(models.Resume);
    };

    const _isApplicationComplete = function(application: Application, appValidations: Array<string> = []): boolean {
        let validations = _.union(DEFAULT_APP_VALIDATIONS, appValidations);
        let hasCompleted = true;

        validations.map(key => {
            if (!application[key]) {
                hasCompleted = false;
                return;
            }
        });

        return hasCompleted;
    };

    const _updateApplicationStatus = function(application: Application, options: Application.options) {
        application.application_status = _isApplicationComplete(application) ? 'complete' : 'in_progress';
    };

    // Hooks
    Application.beforeCreate(_updateApplicationStatus);
    Application.beforeUpdate(_updateApplicationStatus);

    return Application;
};