import User from "./user.model.js";
import UserRole from "./user-role.model.js";

User.belongsTo(UserRole, {
    foreignKey: 'user_role_id',
    as: 'user_roles',
});

UserRole.hasMany(User, {
    foreignKey: 'user_role_id',
    as: 'users'
});

export {
    User,
    UserRole,
}