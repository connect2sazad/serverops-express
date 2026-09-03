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

// inventories
import InventoriesListPage from './pages/inventories/list.page.jsx';
import InventoriesViewPage from './pages/inventories/view.page.jsx';

import UsersListPage from './pages/users/list.page.jsx';

// error pages
import ForbiddenPage from './pages/forbidden.page';
import NotFoundPage from "./pages/not-found.page.jsx";
import UserRolesListPage from './pages/user-roles/list.page.jsx';
import CredentialsListPage from './pages/credentials/list.page.jsx';
import CommandExecutionsListPage from './pages/command-executions/list.page.jsx';
// import ServicesListPage from './pages/services/list.page.jsx';

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
            <ProtectedRoute permissions={['inventories.list']}>
              <InventoriesListPage />
            </ProtectedRoute>
          } />

          <Route path='/inventories/:id/' element={
            <ProtectedRoute permissions={['inventories.read']}>
              <InventoriesViewPage />
            </ProtectedRoute>
          } />

          <Route path='/users' element={
            <ProtectedRoute permissions={['users.list']}>
              <UsersListPage />
            </ProtectedRoute>
          } />

          <Route path='/user-roles' element={
            <ProtectedRoute permissions={['user-roles.list']}>
              <UserRolesListPage />
            </ProtectedRoute>
          } />

          <Route path='/credentials' element={
            <ProtectedRoute permissions={['credentials.list']}>
              <CredentialsListPage />
            </ProtectedRoute>
          } />

          <Route path='/command-executions' element={
            <ProtectedRoute permissions={['command-executions.list']}>
              <CommandExecutionsListPage />
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
