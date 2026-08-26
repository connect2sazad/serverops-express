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
    await queryInterface.createTable('credentials', {

      // inherited
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

      username: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },

      type: {
        type: Sequelize.ENUM(['password', 'private-key']),
        allowNull: false,
        defaultValue: 'password'
      },

      secret: {
        type: Sequelize.TEXT,
        allowNull: false,
      },

      passphrase: {
        type: Sequelize.TEXT,
        allowNull: true,
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
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable('credentials');
  }
};
