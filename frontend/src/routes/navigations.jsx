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
        permission: 'inventories.list'
    },
    // {
    //     to: '/users',
    //     label: 'Users',
    //     icon: 'bi-person',
    //     permission: 'users.list'
    // },
    // {
    //     to: '/user-roles',
    //     label: 'User Roles',
    //     icon: 'bi-people',
    //     permission: 'users-roles.list'
    // },
    {
        to: '/credentials',
        label: 'Credentials',
        icon: 'bi-key',
        permission: 'credentials.list'
    },
    // {
    //     to: '/command-executions',
    //     label: 'Command Executions',
    //     icon: 'bi-terminal',
    //     permission: 'command-executions.list'
    // },
    // {
    //     to: '/services',
    //     label: 'Services',
    //     icon: 'bi-briefcase',
    //     permission: 'services.list'
    // },
    // {
    //     to: '/processes',
    //     label: 'Processes',
    //     icon: 'bi-cpu',
    //     permission: 'processes.list'
    // },
    // {
    //     to: '/managed-services',
    //     label: 'Managed Services',
    //     icon: 'bi-gear-wide-connected',
    //     permission: 'managed-services.list'
    // },
    // {
    //     to: '/managed-commands',
    //     label: 'Managed Commands',
    //     icon: 'bi-terminal-split',
    //     permission: 'managed-commands.list'
    // },
];

export default primaryNavigation;