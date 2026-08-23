import { DataTypes } from 'sequelize';

export const baseFields = {
    
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    },

    remarks: {
        type: DataTypes.TEXT,
        allowNull: true,
    },

    tags: {
        type: DataTypes.JSON,
        allowNull: true,
    },

    status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
}

export const baseOptions = {
    timestamps: true,

    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    
    paranoid: true,

    underscored: true,
};