'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addConstraint('tags', ['meta_value'], {
      type: 'unique',
      name: 'unique_tag_meta_value'
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeConstraint('tags', 'unique_tag_meta_value');
  }
};
