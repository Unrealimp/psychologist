import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { SiteDataProvider } from '@/app/context/SiteDataContext';
import { HomePage } from '@/app/pages/HomePage';
import { LoginPage } from '@/app/pages/LoginPage';
import { AdminPage } from '@/app/pages/AdminPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuth = localStorage.getItem('adminAuth') === 'true';
  return isAuth ? <>{children}</> : <Navigate to="/login" />;
}

export default function App() {
  return (
    <SiteDataProvider>
      <BrowserRouter>
        <Toaster position="top-center" richColors />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </SiteDataProvider>
  );
}
