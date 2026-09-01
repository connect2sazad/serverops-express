'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('managed_services', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },

      inventory_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'inventories',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },

      service_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },

      can_restart: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      can_start: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      can_stop: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      can_enable: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      can_disable: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      creator_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },

      status: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },

      remarks: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      tags: {
        type: Sequelize.JSON,
        allowNull: true,
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
      },
    });

    await queryInterface.addIndex('managed_services', {
      fields: ['inventory_id', 'service_name'],
      unique: true,
      name: 'managed_services_inventory_service_unique',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('managed_services');
  },
};

