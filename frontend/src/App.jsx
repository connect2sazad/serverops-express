import {
  Route, Routes
} from 'react-router-dom';

import './App.css'

// protected route
import ProtectedRoute from './routes/protected.route';

// layout
import AppLayout from './layouts/app.layout';

// redner pages
import LoginPage from './pages/login.page';
import DashboardPage from './pages/dashboard.page';

// pages
import InventoriesPage from './pages/inventories/index.page.jsx';
import ServicesPage from './pages/services/index.page.jsx';
import ProcessesPage from './pages/processes/index.page.jsx';
import CommandExecutionsPage from './pages/command-executions/index.page.jsx';
import ManagedServicesPage from './pages/managed-services/index.page';
import ManagedCommandsPage from './pages/managed-commands/index.page';
// error pages
import ForbiddenPage from './pages/forbidden.page';
import NotFoundPage from "./pages/not-found.page.jsx";
import CredentialsPage from './pages/credentials/index.page.jsx';
import { PERMISSIONS } from './config/permissions.js';
import UserRolesPage from './pages/user-roles/index.page.jsx';
import UsersPage from './pages/users/index.page.jsx';

function App() {

  return (
    <>
      <Routes>

        <Route path='/login' element={<LoginPage />} />

        <Route path='/forbidden' element={<ForbiddenPage />} />

        <Route element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
        >

          <Route index element={<DashboardPage />} />

          <Route path='/inventories' element={
            <ProtectedRoute permissions={[PERMISSIONS.INVENTORIES_LIST]}>
              <InventoriesPage />
            </ProtectedRoute>
          } />

          <Route path='/inventories/:id/services' element={
            <ProtectedRoute permissions={[PERMISSIONS.SERVICES_LIST]}>
              <ServicesPage />
            </ProtectedRoute>
          } />

          <Route path='/inventories/:id/processes' element={
            <ProtectedRoute permissions={[PERMISSIONS.PROCESSES_LIST]}>
              <ProcessesPage />
            </ProtectedRoute>
          } />

          <Route path="/inventories/:id/managed-services" element={
            <ProtectedRoute permissions={[PERMISSIONS.MANAGED_SERVICES_LIST]}>
              <ManagedServicesPage />
            </ProtectedRoute>
          } />

          <Route path="/inventories/:id/managed-commands" element={
            <ProtectedRoute permissions={[PERMISSIONS.MANAGED_COMMANDS_LIST]}>
              <ManagedCommandsPage />
            </ProtectedRoute>
          } />

          <Route path='/credentials' element={
            <ProtectedRoute permissions={[PERMISSIONS.CREDENTIALS_LIST]}>
              <CredentialsPage />
            </ProtectedRoute>
          } />

          <Route path='/command-executions' element={
            <ProtectedRoute permissions={[PERMISSIONS.COMMAND_EXECUTIONS_LIST]}>
              <CommandExecutionsPage />
            </ProtectedRoute>
          } />

          <Route path='/user-roles' element={
            <ProtectedRoute permissions={[PERMISSIONS.USER_ROLES_LIST]}>
              <UserRolesPage />
            </ProtectedRoute>
          } />

          <Route path='/users' element={
            <ProtectedRoute permissions={[PERMISSIONS.USER_ROLES_LIST]}>
              <UsersPage />
            </ProtectedRoute>
          } />



        </Route>

        <Route
          path="*"
          element={<NotFoundPage />}
        />

      </Routes>
    </>
  )
}

export default App
