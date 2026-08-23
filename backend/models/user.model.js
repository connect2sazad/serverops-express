import { DataTypes } from 'sequelize';

import sequelize from '../config/sequelize.js';

import {
    baseFields,
    baseOptions
} from './base.model.js';


const User = sequelize.define(
    'User',
    {
        ...baseFields,

        name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },

        email: {
            type: DataTypes.STRING(150),
            allowNull: false,
            unique: true
        },

        userid: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
        },

        password: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
    },
    {
        ...baseOptions,
        tableName: 'users',
    }
);

export default User;