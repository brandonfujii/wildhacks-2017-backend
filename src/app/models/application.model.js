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
            type: STRING
        },
        last_name: {
            type: STRING
        },
        age: {
            type: INTEGER,
            allowNull: true,
        },
        gender: {
            type: ENUM,
            allowNull: true,
            values: ['male', 'female', 'non_binary', 'other', 'prefer_not_to_say'],
            defaultValue: null,
            validate: {
                isIn: {
                    args: [[null, 'male', 'female', 'non_binary', 'other', 'prefer_not_to_say']],
                    msg: 'Must be one of given options',
                },
            },
        },
        tshirt_size: {
            type: ENUM,
            allowNull: true,
            values: ['small', 'medium', 'large', 'xl', 'xxl'],
            defaultValue: null,
            validate: {
                isIn: {
                    args: [[null,'small', 'medium', 'large', 'xl', 'xxl']],
                    msg: 'Must be one of given options',
                },
            },
        },
        ethnicity: {
            type: Sequelize.ENUM,
            allowNull: true,
            values: ['white', 'black', 'asian', 'native_american', 'pacific_islander', 'latino', 'two_or_more_races', 'other'],
            defaultValue: null,
            validate: {
                isIn: {
                    args: [[null, 'white', 'black', 'asian', 'native_american', 'pacific_islander', 'latino', 'two_or_more_races', 'other']],
                    msg: 'Must be one of given options',
                },
            },
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
        rsvp: {
            type: ENUM,
            values: ['yes', 'no', 'undecided'],
            validate: {
                isIn: {
                    args: [['yes', 'no', 'undecided']],
                    msg: 'Must be a valid RSVP value',
                },
            },
        },
        decision: {
            type: ENUM,
            values: ['accepted', 'rejected', 'waitlisted', 'undecided'],
            validate: {
                isIn: {
                    args: [['accepted', 'rejected', 'waitlisted', 'undecided']],
                    msg: 'Must be a valid decision',
                },
            },
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
        Application.belongsToMany(models.Skill, {
            through: models.ApplicationSkill
        });
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