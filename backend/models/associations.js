import User from "./user.model.js";
import UserRole from "./user-role.model.js";
import Inventory from "./inventory.model.js";
import Credential from "./credential.model.js";
import CommandExecution from "./command-execution.model.js";
import ManagedService from "./managed-service.model.js";
import ManagedCommand from "./managed-command.model.js";

// =============================USER, USER ROLE============================
// associate user to user role
User.belongsTo(UserRole, {
    foreignKey: 'user_role_id',
    as: 'role',
});
UserRole.hasMany(User, {
    foreignKey: 'user_role_id',
    as: 'users'
});

// =============================INVENTORY, USER============================
// associate inventory to creator user
Inventory.belongsTo(User, {
    foreignKey: 'creator_id',
    as: 'creator',
});
User.hasMany(Inventory, {
    foreignKey: 'creator_id',
    as: 'inventories',
});

// =============================CREDENTIAL, INVENTORY, USER============================
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


// =============================COMMAND EXECUTION, MANAGED_COMMANDS, CREDENTIAL, INVENTORY, USER============================
// associate command execution to creator user
CommandExecution.belongsTo(User, {
    foreignKey: 'creator_id',
    as: 'creator',
});
User.hasMany(CommandExecution, {
    foreignKey: 'creator_id',
    as: 'command_executions',
});

// associate inventory to command execution
CommandExecution.belongsTo(Inventory, {
    foreignKey: 'inventory_id',
    as: 'inventory',
});

Inventory.hasMany(CommandExecution, {
    foreignKey: 'inventory_id',
    as: 'command_executions',
});

CommandExecution.belongsTo(Credential, {
    foreignKey: 'credential_id',
    as: 'credential',
});

Credential.hasMany(CommandExecution, {
    foreignKey: 'credential_id',
    as: 'command_executions',
});

CommandExecution.belongsTo(ManagedCommand, {
    foreignKey: 'managed_command_id',
    as: 'managed_command',
});

ManagedCommand.hasMany(CommandExecution, {
    foreignKey: 'managed_command_id',
    as: 'command_executions',
});

// =============================MANAGED_SERVICE, INVENTORY, USER============================
ManagedService.belongsTo(Inventory, {
    foreignKey: 'inventory_id',
    as: 'inventory',
});

Inventory.hasMany(ManagedService, {
    foreignKey: 'inventory_id',
    as: 'managed_services',
});

ManagedService.belongsTo(User, {
    foreignKey: 'creator_id',
    as: 'creator',
});

User.hasMany(ManagedService, {
    foreignKey: 'creator_id',
    as: 'managed_services',
});


// =============================MANAGED_COMMAND, INVENTORY, USER============================
ManagedCommand.belongsTo(Inventory, {
    foreignKey: 'inventory_id',
    as: 'inventory',
});

Inventory.hasMany(ManagedCommand, {
    foreignKey: 'inventory_id',
    as: 'managed_commands',
});

ManagedCommand.belongsTo(User, {
    foreignKey: 'creator_id',
    as: 'creator',
});

User.hasMany(ManagedCommand, {
    foreignKey: 'creator_id',
    as: 'managed_commands',
});


export {
    User,
    UserRole,
    Inventory,
    CommandExecution,
    ManagedService,
    ManagedCommand,
}