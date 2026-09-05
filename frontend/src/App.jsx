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
import InventoriesPage from './pages/inventories/index.page.jsx';
// error pages
import ForbiddenPage from './pages/forbidden.page';
import NotFoundPage from "./pages/not-found.page.jsx";
import CredentialsPage from './pages/credentials/index.page.jsx';

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
              <InventoriesPage />
            </ProtectedRoute>
          } />

          <Route path='/credentials' element={
            <ProtectedRoute permissions={['credentials.list']}>
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
