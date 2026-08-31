import {
  Route, Routes
} from 'react-router-dom';

import './App.css'
import LoginPage from './pages/login.page';
import ForbiddenPage from './pages/forbidden.page';
import ProtectedRoute from './routes/protected.route';
import AppLayout from './layouts/app.layout';
import DashboardPage from './pages/dashboard.page';

function App() {

  return (
    <>
      <Routes>

        <Route path='/login' element={<LoginPage />} />

        <Route path='/forbidden' element={<ForbiddenPage/>} />

        <Route element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >

          <Route index element={<DashboardPage />} />

        </Route>

      </Routes>
    </>
  )
}

export default App
