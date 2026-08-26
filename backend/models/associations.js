import User from "./user.model.js";
import UserRole from "./user-role.model.js";
import Inventory from "./inventory.model.js";

User.belongsTo(UserRole, {
    foreignKey: 'user_role_id',
    as: 'role',
});

UserRole.hasMany(User, {
    foreignKey: 'user_role_id',
    as: 'users'
});

Inventory.belongsTo(User, {
    foreignKey: 'creator_id',
    as: 'user',
});

User.hasMany(Inventory, {
    foreignKey: 'creator_id',
    as: 'inventories',
});

export {
    User,
    UserRole,
    Inventory,
}