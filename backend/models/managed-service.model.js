import { DataTypes } from 'sequelize';

import sequelize from '../config/sequelize.js';
import { baseFields, baseOptions } from './base.model.js';

const ManagedService = sequelize.define(
    'ManagedService',
    {
        ...baseFields,

        inventory_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        service_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },

        can_restart: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },

        can_start: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },

        can_stop: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },

        can_enable: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },

        can_disable: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },

        creator_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

    },
    {
        ...baseOptions,
        tableName: 'managed_services',
    }
);

export default ManagedService;