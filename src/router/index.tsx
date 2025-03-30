import { useAuth } from '@/app/context/use-auth';
import * as Environment from '@/views';
import * as Layout from '@/views/layouts';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';

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
    </Routes>
  );
}

type AuthGuardProps = {
  isPrivate?: boolean;
};

export function AuthGuard({ isPrivate }: AuthGuardProps) {
  const { isAuth } = useAuth();

  if (!isAuth && isPrivate) {
    return <Navigate to="/auth" />;
  }

  if (isAuth && !isPrivate) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
