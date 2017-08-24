'use strict';

module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          isEmail: true
        }
      },
      password: {
        type: Sequelize.STRING
      },
      privilege: {
        type: Sequelize.ENUM,
        values: ['admin', 'user'],
        defaultValue: 'user'
      },
      type: {
        type: Sequelize.ENUM,
        values: ['mentor', 'student'],
        defaultValue: 'student'
      },
      is_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      token_id: {
        type: Sequelize.INTEGER
      },
      verification_token_id: {
        type: Sequelize.INTEGER
      },
      application_id: {
        type: Sequelize.INTEGER
      },
      team_id: {
        type: Sequelize.INTEGER
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    })
    .then(function() {
      return queryInterface.addConstraint('users', ['email'], {
        type: 'unique'
      });
    });

  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('users');
  }
};