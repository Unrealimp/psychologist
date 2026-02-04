import { Suspense, lazy, type ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { SiteDataProvider } from '@/app/context/SiteDataContext';
import { HomePage } from '@/app/pages/HomePage';

const LoginPage = lazy(async () => {
  const module = await import('@/app/pages/LoginPage');
  return { default: module.LoginPage };
});

const AdminPage = lazy(async () => {
  const module = await import('@/app/pages/AdminPage');
  return { default: module.AdminPage };
});

function ProtectedRoute({ children }: { children: ReactNode }) {
  const isAuth = Boolean(localStorage.getItem('adminToken'));
  return isAuth ? <>{children}</> : <Navigate to="/login" />;
}

export default function App() {
  return (
    <SiteDataProvider>
      <BrowserRouter>
        <Toaster position="top-center" richColors />
        <Suspense fallback={null}>
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
        </Suspense>
      </BrowserRouter>
    </SiteDataProvider>
  );
}
