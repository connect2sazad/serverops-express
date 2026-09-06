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
// error pages
import ForbiddenPage from './pages/forbidden.page';
import NotFoundPage from "./pages/not-found.page.jsx";
import CredentialsPage from './pages/credentials/index.page.jsx';
import { PERMISSIONS } from './config/permissions.js';

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

          <Route path='/credentials' element={
            <ProtectedRoute permissions={[PERMISSIONS.CREDENTIALS_LIST]}>
              <CredentialsPage />
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
