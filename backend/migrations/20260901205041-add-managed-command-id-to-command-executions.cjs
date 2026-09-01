'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.addColumn(
      'command_executions',
      'managed_command_id',
      {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'managed_commands',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      }
    );

    await queryInterface.addIndex(
      'command_executions',
      ['managed_command_id'],
      {
        name:
          'command_executions_managed_command_index',
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(
      'command_executions',
      'command_executions_managed_command_index'
    );

    await queryInterface.removeColumn(
      'command_executions',
      'managed_command_id'
    );
  },
};
