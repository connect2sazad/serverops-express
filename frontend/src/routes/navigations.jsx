import {
    PERMISSIONS,
} from '../config/permissions';


const primaryNavigation = [
    {
        to: '/',
        label: 'Dashboard',
        icon: 'bi-speedometer2',
        end: true,
    },

    {
        to: '/inventories',
        label: 'Inventories',
        icon: 'bi-hdd-rack',
        permission:
            PERMISSIONS.INVENTORIES_LIST,
    },

    {
        to: '/credentials',
        label: 'Credentials',
        icon: 'bi-key',
        permission:
            PERMISSIONS.CREDENTIALS_LIST,
    },

    {
        to: '/command-executions',
        label: 'Command Executions',
        icon: 'bi-terminal',
        permission:
            PERMISSIONS.COMMAND_EXECUTIONS_LIST,
    },

    {
        to: '/users',
        label: 'Users',
        icon: 'bi-person',
        permission:
            PERMISSIONS.USERS_LIST,
    },

    {
        to: '/user-roles',
        label: 'User Roles',
        icon: 'bi-people',
        permission:
            PERMISSIONS.USER_ROLES_LIST,
    },
];


export default primaryNavigation;