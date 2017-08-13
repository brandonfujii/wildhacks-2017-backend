'use strict';

module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('applications_skills', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      application_id: {
          type: Sequelize.INTEGER,
          onDelete: 'CASCADE',
          allowNull: false,
          references: {
            model: 'applications',
            key: 'id'
          }
      },
      skill_id: {
          type: Sequelize.INTEGER,
          onDelete: 'CASCADE',
          allowNull: false,
          references: {
            model: 'skills',
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
    return queryInterface.dropTable('applications_skills');
  }
};