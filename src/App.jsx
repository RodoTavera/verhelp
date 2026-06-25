import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

// Pages
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Pets from './pages/Pets'
import Records from './pages/Records'
import Travel from './pages/Travel'
import Guides from './pages/Guides'
import Admin from './pages/Admin'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/guides" element={<Guides />} />
            
            {/* Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['owner', 'family', 'vet', 'airline']} />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/pets" element={<Pets />} />
              <Route path="/records" element={<Records />} />
              <Route path="/travel" element={<Travel />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin" element={<Admin />} />
            </Route>

            <Route path="*" element={<Navigate to="/" />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
