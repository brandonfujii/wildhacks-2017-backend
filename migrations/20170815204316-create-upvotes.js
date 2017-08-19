'use strict';

module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('upvotes', {
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
      talk_id: {
          type: Sequelize.INTEGER,
          onDelete: 'CASCADE',
          allowNull: false,
          references: {
            model: 'talks',
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
    return queryInterface.dropTable('upvotes');
  }
};