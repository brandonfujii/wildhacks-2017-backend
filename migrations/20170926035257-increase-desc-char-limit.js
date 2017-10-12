'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.sequelize.query("ALTER TABLE talks MODIFY description TEXT;");
  },

  down: (queryInterface, Sequelize) => {
    queryInterface.sequelize.query("ALTER TABLE talks MODIFY description VARCHAR(255);");
  }
};
