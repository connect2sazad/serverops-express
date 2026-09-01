'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.addColumn('inventories', 'discovered_hostname', {
      type: Sequelize.STRING(100),
      allowNull: true,
    }
    );

    await queryInterface.addColumn('inventories', 'os_name', {
      type: Sequelize.STRING(100),
      allowNull: true,
    }
    );

    await queryInterface.addColumn('inventories', 'os_version', {
      type: Sequelize.STRING(100),
      allowNull: true,
    }
    );

    await queryInterface.addColumn('inventories', 'os_version_id', {
      type: Sequelize.STRING(100),
      allowNull: true,
    }
    );

    await queryInterface.addColumn('inventories', 'kernel', {
      type: Sequelize.STRING(100),
      allowNull: true,
    }
    );

    await queryInterface.addColumn('inventories', 'architecture', {
      type: Sequelize.STRING(100),
      allowNull: true,
    }
    );

    await queryInterface.addColumn('inventories', 'cpu_cores', {
      type: Sequelize.STRING(100),
      allowNull: true,
    }
    );

    await queryInterface.addColumn('inventories', 'memory_total_kib', {
      type: Sequelize.STRING(100),
      allowNull: true,
    }
    );

    await queryInterface.addColumn('inventories', 'uptime_seconds', {
      type: Sequelize.STRING(100),
      allowNull: true,
    }
    );

    await queryInterface.addColumn('inventories', 'inventory_collected_at', {
      type: Sequelize.STRING(100),
      allowNull: true,
    }
    );

    await queryInterface.addColumn('inventories', 'inventory_partial', {
      type: Sequelize.STRING(100),
      allowNull: true,
    }
    );

    await queryInterface.addColumn('inventories', 'inventory_missing_fields', {
      type: Sequelize.STRING(100),
      allowNull: true,
    }
    );

  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('inventories', 'inventory_missing_fields');
    await queryInterface.removeColumn('inventories', 'inventory_partial');
    await queryInterface.removeColumn('inventories', 'inventory_collected_at');
    await queryInterface.removeColumn('inventories', 'uptime_seconds');
    await queryInterface.removeColumn('inventories', 'memory_total_kib');
    await queryInterface.removeColumn('inventories', 'cpu_cores');
    await queryInterface.removeColumn('inventories', 'architecture');
    await queryInterface.removeColumn('inventories', 'kernel');
    await queryInterface.removeColumn('inventories', 'os_version_id');
    await queryInterface.removeColumn('inventories', 'os_version');
    await queryInterface.removeColumn('inventories', 'os_name');
    await queryInterface.removeColumn('inventories', 'discovered_hostname');
  }
};
