import { DataTypes } from 'sequelize';

import sequelize from '../config/sequelize.js';
import { baseFields, baseOptions } from './base.model.js';

const ManagedCommand = sequelize.define(
    'ManagedCommand',
    {
        ...baseFields,

        inventory_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },

        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },

        command: {
            type: DataTypes.TEXT('long'),
            allowNull: false,
        },

        timeout_seconds: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            defaultValue: 30,
        },

        creator_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

    },
    {
        ...baseOptions,
        tableName: 'managed_commands',
    }
);

export default ManagedCommand;