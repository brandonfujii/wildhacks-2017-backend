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
      first_name: {
        type: Sequelize.STRING
      },
      last_name: {
        type: Sequelize.STRING
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
      school: {
        type: Sequelize.STRING,
        allowNull: true
      },
      token_id: {
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