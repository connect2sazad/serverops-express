'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable('inventories', {
      
      // inherited
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },

      // actual
      name: {
        type: Sequelize.STRING(100),
        unique: true,
        index: true,
        allowNull: false
      },

      hostname: {
        type: Sequelize.STRING(100),
        index: true,
        allowNull: false,
        unique: true,
      },

      ssh_port: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 22,
      },

      ssh_username: {
        type: Sequelize.STRING(100),
        allowNull: false
      },

      environment: {
        type: Sequelize.STRING(100),
        allowNull: false,
        defaultValue: 'production',
      },

      operating_system: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },

      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },

      connection_status: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'unknown',
      },

      last_connected_at: {
        type: Sequelize.DATE,
        allowNull: true
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
    })
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable('inventories');
  }
};
