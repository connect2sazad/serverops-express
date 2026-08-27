import { DataTypes } from "sequelize";

import sequelize from "../config/sequelize.js";
import { baseFields, baseOptions } from "./base.model.js";

const Inventory = sequelize.define(
    'Inventory',
    {
        ...baseFields,
        name: {
            type: DataTypes.STRING(100),
            unique: true,
            index: true,
            allowNull: false
        },

        hostname: {
            type: DataTypes.STRING(100),
            index: true,
            allowNull: false,
            unique: true
        },

        ssh_port: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 22,
        },

        environment: {
            type: DataTypes.STRING(100),
            allowNull: false,
            defaultValue: 'production',
        },

        operating_system: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },

        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },

        connection_status: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: 'unknown',
        },

        last_connected_at: {
            type: DataTypes.DATE,
            allowNull: true
        },

        ssh_host_key_fingerprint: {
            type: DataTypes.STRING(255),
            allowNull: true
        },

        creator_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            index: true

        },
    },
    {
        ...baseOptions,
        tableName: 'inventories',
    }
);

export default Inventory;