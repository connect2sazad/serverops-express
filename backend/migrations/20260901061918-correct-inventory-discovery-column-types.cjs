'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn('inventories', 'os_version', {
            type: Sequelize.STRING(255),
            allowNull: true,
        });

        await queryInterface.changeColumn('inventories', 'os_version_id', {
            type: Sequelize.STRING(50),
            allowNull: true,
        });

        await queryInterface.changeColumn('inventories', 'architecture', {
            type: Sequelize.STRING(50),
            allowNull: true,
        });

        await queryInterface.changeColumn('inventories', 'cpu_cores', {
            type: Sequelize.INTEGER,
            allowNull: true,
        });

        await queryInterface.changeColumn('inventories', 'memory_total_kib', {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
        });

        await queryInterface.changeColumn('inventories', 'uptime_seconds', {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
        });

        await queryInterface.changeColumn('inventories', 'inventory_collected_at', {
            type: Sequelize.DATE,
            allowNull: true,
        });

        await queryInterface.changeColumn('inventories', 'inventory_partial', {
            type: Sequelize.BOOLEAN,
            allowNull: true,
        });

        await queryInterface.changeColumn('inventories', 'inventory_missing_fields', {
            type: Sequelize.JSON,
            allowNull: true,
        });
    },

    async down(queryInterface, Sequelize) {
        const stringColumn = {
            type: Sequelize.STRING(100),
            allowNull: true,
        };

        await queryInterface.changeColumn('inventories', 'os_version', stringColumn);
        await queryInterface.changeColumn('inventories', 'os_version_id', stringColumn);
        await queryInterface.changeColumn('inventories', 'architecture', stringColumn);
        await queryInterface.changeColumn('inventories', 'cpu_cores', stringColumn);
        await queryInterface.changeColumn('inventories', 'memory_total_kib', stringColumn);
        await queryInterface.changeColumn('inventories', 'uptime_seconds', stringColumn);
        await queryInterface.changeColumn('inventories', 'inventory_collected_at', stringColumn);
        await queryInterface.changeColumn('inventories', 'inventory_partial', stringColumn);
        await queryInterface.changeColumn('inventories', 'inventory_missing_fields', stringColumn);
    },
};