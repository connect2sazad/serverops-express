import { useState } from 'react';

import {
    NavLink, Outlet, useNavigate
} from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';
import primaryNavigation from '../routes/navigations';

export default function AppLayout() {

    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const {
        user, logout, hasPermission
    } = useAuth();

    async function handleLogout() {
        await logout();

        navigate('/login', {
            replace: true,
        });
    }

    return (
        <div className="app-shell">
            <aside
                className={
                    sidebarOpen
                        ? "app-sidebar"
                        : "app-sidebar app-sidebar-collapsed"
                }
            >
                <div className="sidebar-brand">
                    <i className="bi bi-server me-2" />

                    {sidebarOpen && (
                        <span>ServerOps</span>
                    )}
                </div>

                <nav className="nav flex-column gap-1 p-2">
                    {primaryNavigation
                    .filter(item => !item.permission || hasPermission(item.permission))
                    .map(
                        ({
                            to, label, icon,end,
                        }) => (
                            <NavLink key={to} to={to} end={end}
                                className={({ isActive }) =>
                                    `sidebar-link ${isActive ? "active" : ""
                                    }`
                                }
                            >
                                <i className={`bi ${icon}`} />

                                {sidebarOpen && (
                                    <span>{label}</span>
                                )}
                            </NavLink>
                        )
                    )}

                    {/* {hasPermission('users.list') && (
                        <NavLink to="/users"
                            className={({ isActive }) =>
                                `sidebar-link ${isActive ? "active" : ""
                                }`
                            }
                        >
                            <i className="bi bi-people" />

                            {sidebarOpen && (
                                <span>Users</span>
                            )}
                        </NavLink>
                    )} */}
                </nav>
            </aside>

            <div className="app-content">
                <header className="app-topbar">
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-primary btn-blue-outline"
                        aria-label="Toggle sidebar"
                        onClick={() => {
                            setSidebarOpen(
                                (current) => !current
                            );
                        }}
                    >
                        <i className="bi bi-list" />
                    </button>

                    <div className="ms-auto d-flex align-items-center gap-3">
                        <div className="text-end">
                            <div className="small fw-semibold">
                                {user.name || user.userid}
                            </div>

                            <div className="small text-secondary text-capitalize">
                                {user.role?.name || user.role?.slug}
                            </div>
                        </div>

                        <button
                            className="btn btn-sm btn-outline-danger btn-red-outline"
                            type="button"
                            onClick={handleLogout}
                        >
                            <i className="bi bi-box-arrow-right me-1" />
                            Logout
                        </button>
                    </div>
                </header>

                <main className="app-page">
                    <Outlet />
                </main>
            </div>
        </div>
    );

}