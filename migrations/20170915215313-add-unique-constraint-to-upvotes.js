'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addConstraint('upvotes', ['user_id', 'talk_id'], {
      type: 'unique',
      name: 'unique_upvote_composite_key'
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeConstraint('upvotes', 'unique_upvote_composite_key');
  }
};
