'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    // add user_id to table
    await queryInterface.addColumn('token_blacklist', 'user_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });

    // remove userid from table
    await queryInterface.removeColumn(
      'token_blacklist',
      'userid'
    )
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('token_blacklist', 'user_id');

    await queryInterface.addColumn(
      'token_blacklist',
      'userid',
      {
        type: Sequelize.INTEGER,
        allowNull: false,
      }
    );
  }
};
