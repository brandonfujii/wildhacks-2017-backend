'use strict';

module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('applications', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
          type: Sequelize.INTEGER,
          onDelete: 'CASCADE',
          allowNull: false,
          references: {
            model: 'users',
            key: 'id'
          }
      },
      resume_id: {
        type: Sequelize.INTEGER
      },
      first_name: {
        type: Sequelize.STRING,
        allowNull: true
      },
      last_name: {
        type: Sequelize.STRING,
        allowNull: true
      },
      age: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      gender: {
        type: Sequelize.ENUM,
        allowNull: true,
        values: ['male', 'female', 'non_binary', 'other', 'prefer_not_to_say'],
        defaultValue: null
      },
      tshirt_size: {
        type: Sequelize.ENUM,
        allowNull: true,
        values: ['small', 'medium', 'large', 'xl', 'xxl'],
        defaultValue: null
      },
      ethnicity: {
        type: Sequelize.ENUM,
        allowNull: true,
        values: ['white', 'black', 'asian', 'native_american', 'pacific_islander', 'latino', 'two_or_more_races', 'other'],
        defaultValue: null
      },
      grad_year: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      school: {
        type: Sequelize.STRING,
        allowNull: true
      },
      major: {
        type: Sequelize.STRING,
        allowNull: true
      },
      personal_website: {
        type: Sequelize.STRING,
        allowNull: true
      },
      num_prev_hackathons: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      github_username: {
        type: Sequelize.STRING,
        allowNull: true 
      },
      application_status: {
        type: Sequelize.ENUM,
        values: ['not_started', 'complete', 'in_progress'],
        defaultValue: 'not_started'
      },
      decision: {
        type: Sequelize.ENUM,
        values: ['accepted', 'rejected', 'waitlisted', 'undecided'],
        defaultValue: 'undecided'
      },
      rsvp: {
        type: Sequelize.ENUM,
        values: ['yes', 'no', 'undecided'],
        defaultValue: 'undecided'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('applications');
  }
};