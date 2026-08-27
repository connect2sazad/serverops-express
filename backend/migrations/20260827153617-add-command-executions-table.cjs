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
    await queryInterface.createTable('command_executions', {

      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },

      // actual
      inventory_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        index: true,
        references: {
          model: 'inventories',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },

      credential_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        index: true,
        references: {
          model: 'credentials',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },

      creator_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        index: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },

      command: {
        type: Sequelize.TEXT,
        allowNull: false,
      },

      stdout: {
        type: Sequelize.TEXT,
        allowNull: true
      },

      stderr: {
        type: Sequelize.TEXT,
        allowNull: true
      },

      exit_code: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      command_status: {
        type: Sequelize.ENUM(['success', 'failed']),
        allowNull: false,
      },

      duration: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      started_at: {
        type: Sequelize.DATE,
        allowNull: false
      },

      finished_at: {
        type: Sequelize.DATE,
        allowNull: false
      },

      // inherited
      remarks: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      tags: {
        type: Sequelize.JSON,
        allowNull: true,
      },

      status: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal(
          'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
        ),
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      }

    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable('command_executions');
  }
};
