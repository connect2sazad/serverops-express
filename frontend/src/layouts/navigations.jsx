const primaryNavigation = [
    {
        to: '/',
        label: 'Dashboard',
        icon: 'bi-speedometer2',
        end: true,
        permission: 'dashboard.view',
    },
    {
        to: '/inventories',
        label: 'Inventories',
        icon: 'bi-hdd-rack',
        permission: 'inventories.list'
    },
    {
        to: '/users',
        label: 'Users',
        icon: 'bi-person',
        permission: 'users.list'
    },
    {
        to: '/user-roles',
        label: 'User Roles',
        icon: 'bi-people',
        permission: 'users.list'
    },
];

export default primaryNavigation;