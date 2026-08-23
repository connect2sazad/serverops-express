import { DataTypes } from 'sequelize';

import sequelize from '../config/sequelize.js';

const TokenBlacklist = sequelize.define(
    'TokenBlacklist',

    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        token: {
            type: DataTypes.TEXT,
            allowNull: false,
            unique: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        expires_at: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        }
    },

    {
        tableName: 'token_blacklist',
        timestamps: false,
        underscored: true,
    }
);

export default TokenBlacklist;