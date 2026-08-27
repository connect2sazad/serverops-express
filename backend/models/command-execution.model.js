import { DataTypes } from 'sequelize';

import sequelize from '../config/sequelize.js';

import {
    baseFields,
    baseOptions
} from './base.model.js';


const CommandExecution = sequelize.define(
    'CommandExecution',
    {
        ...baseFields,

        inventory_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            index: true,
        },

        credential_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            index: true,
        },

        creator_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            index: true,
        },

        command: {
            type: DataTypes.TEXT,
            allowNull: false,
        },

        stdout: {
            type: DataTypes.TEXT,
            allowNull: true
        },

        stderr: {
            type: DataTypes.TEXT,
            allowNull: true
        },

        exit_code: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },

        command_status: {
            type: DataTypes.ENUM(['success', 'failed', 'timeout']),
            allowNull: false,
        },

        duration: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        started_at: {
            type: DataTypes.DATE,
            allowNull: false
        },

        finished_at: {
            type: DataTypes.DATE,
            allowNull: false
        },

    },
    {
        ...baseOptions,
        tableName: 'command_executions',
    }
);

export default CommandExecution;