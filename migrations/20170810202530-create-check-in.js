'use strict';

module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('check_ins', {
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
      event_id: {
          type: Sequelize.INTEGER,
          onDelete: 'CASCADE',
          allowNull: false,
          references: {
            model: 'events',
            key: 'id'
          }
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
    return queryInterface.dropTable('check_ins');
  }
};