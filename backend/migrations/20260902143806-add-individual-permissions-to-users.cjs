'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'individual_permissions', {
      type: Sequelize.JSON,
      allowNull: false,
      defaultValue: '[]',
      after: 'user_role_id',
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'individual_permissions');
  }
};
