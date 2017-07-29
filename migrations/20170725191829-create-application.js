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
      ethnicity: {
        type: Sequelize.STRING,
        allowNull: true
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