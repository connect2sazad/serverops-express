export const PERMISSIONS = Object.freeze({
    ALL: '*',

    // Dashboard
    DASHBOARD_VIEW:
        'dashboard.view',

    DASHBOARD_INVENTORY_SUMMARY:
        'dashboard.inventory-summary',

    DASHBOARD_CONNECTION_HEALTH:
        'dashboard.connection-health',

    DASHBOARD_RESOURCE_USAGE:
        'dashboard.resource-usage',

    DASHBOARD_SERVICE_SUMMARY:
        'dashboard.service-summary',

    DASHBOARD_RECENT_ACTIVITY:
        'dashboard.recent-activity',

    DASHBOARD_FAILED_ACTIONS:
        'dashboard.failed-actions',

    // Inventories
    INVENTORIES_LIST:
        'inventories.list',

    INVENTORIES_READ:
        'inventories.read',

    INVENTORIES_CREATE:
        'inventories.create',

    INVENTORIES_UPDATE:
        'inventories.update',

    INVENTORIES_DELETE:
        'inventories.delete',

    INVENTORIES_STATUS:
        'inventories.status',

    INVENTORIES_HOST_KEY_READ:
        'inventories.host-key.read',

    INVENTORIES_HOST_KEY_TRUST:
        'inventories.host-key.trust',

    INVENTORIES_TEST_CONNECTION:
        'inventories.test-connection',

    INVENTORIES_DISCOVER:
        'inventories.discover',

    // Credentials
    CREDENTIALS_LIST:
        'credentials.list',

    CREDENTIALS_READ:
        'credentials.read',

    CREDENTIALS_CREATE:
        'credentials.create',

    CREDENTIALS_UPDATE:
        'credentials.update',

    CREDENTIALS_DELETE:
        'credentials.delete',

    CREDENTIALS_STATUS:
        'credentials.status',

    // Services
    SERVICES_LIST:
        'services.list',

    SERVICES_READ:
        'services.read',

    SERVICES_START:
        'services.start',

    SERVICES_STOP:
        'services.stop',

    SERVICES_RESTART:
        'services.restart',

    SERVICES_ENABLE:
        'services.enable',

    SERVICES_DISABLE:
        'services.disable',

    // Processes
    PROCESSES_LIST:
        'processes.list',

    PROCESSES_READ:
        'processes.read',

    PROCESSES_TERMINATE:
        'processes.terminate',

    PROCESSES_KILL:
        'processes.kill',

    // Managed services
    MANAGED_SERVICES_LIST:
        'managed-services.list',

    MANAGED_SERVICES_READ:
        'managed-services.read',

    MANAGED_SERVICES_CREATE:
        'managed-services.create',

    MANAGED_SERVICES_UPDATE:
        'managed-services.update',

    MANAGED_SERVICES_DELETE:
        'managed-services.delete',

    MANAGED_SERVICES_STATUS:
        'managed-services.status',

    // Managed commands
    MANAGED_COMMANDS_LIST:
        'managed-commands.list',

    MANAGED_COMMANDS_READ:
        'managed-commands.read',

    MANAGED_COMMANDS_CREATE:
        'managed-commands.create',

    MANAGED_COMMANDS_UPDATE:
        'managed-commands.update',

    MANAGED_COMMANDS_DELETE:
        'managed-commands.delete',

    MANAGED_COMMANDS_STATUS:
        'managed-commands.status',

    MANAGED_COMMANDS_EXECUTE:
        'managed-commands.execute',

    // Command execution audit
    COMMAND_EXECUTIONS_LIST:
        'command-executions.list',

    COMMAND_EXECUTIONS_READ:
        'command-executions.read',

    // Users
    USERS_LIST:
        'users.list',

    USERS_READ:
        'users.read',

    USERS_CREATE:
        'users.create',

    USERS_UPDATE:
        'users.update',

    USERS_DELETE:
        'users.delete',

    USERS_STATUS:
        'users.status',

    // Roles
    ROLES_LIST:
        'roles.list',

    ROLES_READ:
        'roles.read',

    ROLES_CREATE:
        'roles.create',

    ROLES_UPDATE:
        'roles.update',

    ROLES_DELETE:
        'roles.delete',

    ROLES_STATUS:
        'roles.status',
});

export const PERMISSION_VALUES = Object.freeze(
    Object.values(PERMISSIONS)
);

export const DASHBOARD_WIDGETS = Object.freeze({
    INVENTORY_SUMMARY: Object.freeze({
        key: 'inventory-summary',
        title: 'Inventory Summary',

        permission:
            PERMISSIONS.DASHBOARD_INVENTORY_SUMMARY,

        required_permissions: [
            PERMISSIONS.DASHBOARD_VIEW,
            PERMISSIONS.DASHBOARD_INVENTORY_SUMMARY,
            PERMISSIONS.INVENTORIES_LIST,
        ],
    }),

    CONNECTION_HEALTH: Object.freeze({
        key: 'connection-health',
        title: 'Connection Health',

        permission:
            PERMISSIONS.DASHBOARD_CONNECTION_HEALTH,

        required_permissions: [
            PERMISSIONS.DASHBOARD_VIEW,
            PERMISSIONS.DASHBOARD_CONNECTION_HEALTH,
            PERMISSIONS.INVENTORIES_LIST,
        ],
    }),

    RESOURCE_USAGE: Object.freeze({
        key: 'resource-usage',
        title: 'Resource Usage',

        permission:
            PERMISSIONS.DASHBOARD_RESOURCE_USAGE,

        required_permissions: [
            PERMISSIONS.DASHBOARD_VIEW,
            PERMISSIONS.DASHBOARD_RESOURCE_USAGE,
            PERMISSIONS.INVENTORIES_READ,
        ],
    }),

    SERVICE_SUMMARY: Object.freeze({
        key: 'service-summary',
        title: 'Service Summary',

        permission:
            PERMISSIONS.DASHBOARD_SERVICE_SUMMARY,

        required_permissions: [
            PERMISSIONS.DASHBOARD_VIEW,
            PERMISSIONS.DASHBOARD_SERVICE_SUMMARY,
            PERMISSIONS.SERVICES_LIST,
        ],
    }),

    RECENT_ACTIVITY: Object.freeze({
        key: 'recent-activity',
        title: 'Recent Activity',

        permission:
            PERMISSIONS.DASHBOARD_RECENT_ACTIVITY,

        required_permissions: [
            PERMISSIONS.DASHBOARD_VIEW,
            PERMISSIONS.DASHBOARD_RECENT_ACTIVITY,
            PERMISSIONS.COMMAND_EXECUTIONS_LIST,
        ],
    }),

    FAILED_ACTIONS: Object.freeze({
        key: 'failed-actions',
        title: 'Failed Actions',

        permission:
            PERMISSIONS.DASHBOARD_FAILED_ACTIONS,

        required_permissions: [
            PERMISSIONS.DASHBOARD_VIEW,
            PERMISSIONS.DASHBOARD_FAILED_ACTIONS,
            PERMISSIONS.COMMAND_EXECUTIONS_LIST,
        ],
    }),
});

export const DASHBOARD_WIDGET_VALUES =
    Object.freeze(
        Object.values(DASHBOARD_WIDGETS)
    );