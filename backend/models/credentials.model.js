import { DataTypes } from 'sequelize';

import sequelize from '../config/sequelize.js';

import {
    baseFields,
    baseOptions
} from './base.model.js';


const Credential = sequelize.define(
    'Credential',
    {
        ...baseFields,

        inventory_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            index: true
        },

        username: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },

        type:{
            type: DataTypes.ENUM(['password', 'private-key']),
            allowNull: false,
            defaultValue: 'password'
        },

        secret: {
            type: DataTypes.TEXT,
            allowNull: false,
        },

        passphrase: {
            type: DataTypes.TEXT,
            allowNull: true,
        },

        creator_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            index: true

        },
        
    },
    {
        ...baseOptions,
        tableName: 'credentials',
    }
);

export default Credential;