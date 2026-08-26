import { DataTypes } from "sequelize";

import sequelize from "../config/sequelize.js";
import { baseFields, baseOptions } from "./base.model.js";

const UserRole = sequelize.define(
    'UserRole',
    {
        ...baseFields,
        name: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        slug: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
        },
        permissions: {
            type: DataTypes.JSON,
            allowNull: true,
        }
    },
    {
        ...baseOptions,
        tableName: 'user_roles'
    }
);

export default UserRole;