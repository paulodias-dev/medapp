import { useAuth } from '@/app/context/use-auth';
import * as Environment from '@/views';
import * as Layout from '@/views/layouts';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';

export function Router() {
  return (
    <Routes>
      <Route element={<AuthGuard />}>
        <Route path="/auth" element={<Environment.SignIn />} />
        <Route
          path="/forgot-password"
          element={<Environment.ForgotPassword />}
        />
        <Route path="/reset-password" element={<Environment.ResetPassword />} />
        <Route path="/select-tenant" element={<Environment.SelectTenant />} />
      </Route>

      <Route element={<Layout.Default />}>
        <Route element={<AuthGuard isPrivate />}>
          <Route path="/" element={<Environment.Dashboard />} />
          <Route path="/certificates" element={<Environment.Certificates />} />
          <Route path="/newsroom" element={<Environment.News />} />

          <Route path="/certificate">
            <Route path="" element={<Navigate to="date" />} />

            <Route path="date" element={<Environment.DateStep />} />
            <Route path="employee" element={<Environment.EmployeeDataStep />} />
            <Route path="type" element={<Environment.TypeExamStep />} />
            <Route path="exam" element={<Environment.ExamStep />} />
          </Route>

          <Route path="/profile" element={<Layout.Profile />}>
            <Route path="" element={<Navigate to="user-data" />} />

            <Route path="user-data" element={<Environment.Personal />} />
            <Route path="security" element={<Environment.Security />} />
          </Route>
        </Route>
      </Route>

      {/* Manager Routes */}
      <Route element={<Layout.ManagerLayout />}>
        <Route element={<ManagerGuard />}>
          <Route path="/manager" element={<Environment.Dashboard />} />
          <Route path="/manager/dashboard" element={<Navigate to="/manager" replace />} />
          <Route path="/manager/clients" element={<Environment.ClientsList />} />
          <Route path="/manager/users" element={<Environment.UsersList />} />
          {/* Add more manager routes here as they are implemented */}
        </Route>
      </Route>
    </Routes>
  );
}

type AuthGuardProps = {
  isPrivate?: boolean;
};

export function AuthGuard({ isPrivate }: AuthGuardProps) {
  const { isAuth, tenants, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return null; // Or a loading spinner
  }

  if (!isAuth && isPrivate) {
    return <Navigate to="/auth" />;
  }

  if (isAuth && !isPrivate) {
    if (tenants.length > 1 && location.pathname !== '/select-tenant') {
      return <Navigate to="/select-tenant" replace />;
    }

    if (location.pathname === '/select-tenant') {
      return <Outlet />;
    }

    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export function ManagerGuard() {
  const { isAuth, user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuth || (user?.type !== 'worker' && user?.type !== 'admin')) {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
}
