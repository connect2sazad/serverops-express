import User from "./user.model.js";
import UserRole from "./user-role.model.js";
import Inventory from "./inventory.model.js";
import Credential from "./credentials.model.js";

// associate user to user role
User.belongsTo(UserRole, {
    foreignKey: 'user_role_id',
    as: 'role',
});
UserRole.hasMany(User, {
    foreignKey: 'user_role_id',
    as: 'users'
});

// associate inventory to creator user
Inventory.belongsTo(User, {
    foreignKey: 'creator_id',
    as: 'creator',
});
User.hasMany(Inventory, {
    foreignKey: 'creator_id',
    as: 'inventories',
});

// associate credential to creator user
Credential.belongsTo(User, {
    foreignKey: 'creator_id',
    as: 'creator',
});
User.hasMany(Credential, {
    foreignKey: 'creator_id',
    as: 'credentials',
});

// associate inventory to credential
Credential.belongsTo(Inventory, {
    foreignKey: 'inventory_id',
    as: 'inventory',
});

Inventory.hasMany(Credential, {
    foreignKey: 'inventory_id',
    as: 'credentials',
});

export {
    User,
    UserRole,
    Inventory,
}