import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import RequireRole from './components/route/RequireRole'
import AuthPage from './pages/AuthPage'
import UserPage from './pages/UserPage'
import AdminPage from './pages/AdminPage'
import TaxesPage from './pages/TaxesPage'
import AnalyticsPage from './pages/AnalyticsPage'
import EditCompanyPage from './pages/EditCompanyPage'
import EditUnifiedTaxPage from './pages/EditUnifiedTaxPage'
import EditIncomeTaxPage from './pages/EditIncomeTaxPage'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path="/user" element={
            <RequireRole allow={["User"]}>
              <UserPage />
            </RequireRole>
          } />
          <Route path="/user/taxes" element={
            <RequireRole allow={["User"]}>
              <TaxesPage />
            </RequireRole>
          } />
          <Route path="/user/taxes/edit-company" element={
            <RequireRole allow={["User"]}>
              <EditCompanyPage />
            </RequireRole>
          } />
          <Route path="/user/analytics" element={
            <RequireRole allow={["User"]}>
              <AnalyticsPage />
            </RequireRole>
          } />
          <Route path="/admin" element={
            <RequireRole allow={["Admin"]}>
              <AdminPage />
            </RequireRole>
          } />
          <Route path="/admin/edit-unified-tax" element={
            <RequireRole allow={["Admin"]}>
              <EditUnifiedTaxPage />
            </RequireRole>
          } />
          <Route path="/admin/edit-income-tax" element={
            <RequireRole allow={["Admin"]}>
              <EditIncomeTaxPage />
            </RequireRole>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
