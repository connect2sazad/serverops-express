'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('command_executions', 'stdout', {
      type: Sequelize.DataTypes.TEXT('long'),
      allowNull: true,
    });

    await queryInterface.changeColumn('command_executions', 'stderr', {
      type: Sequelize.DataTypes.TEXT('long'),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('command_executions', 'stdout', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.changeColumn('command_executions', 'stderr', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },
};
