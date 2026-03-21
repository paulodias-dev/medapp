import { useAuth } from '@/app/context/use-auth';
import { useAppointmentSettings } from '@/app/hooks/use-appointment-settings';
import * as Layout from '@/views/layouts';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { AppointmentProvider } from '@/app/context/appointment-context';
import { lazy, Suspense, type ReactNode } from 'react';

const SignIn = lazy(() =>
  import('@/views/environments/client/auth/sign-in').then((module) => ({
    default: module.SignIn,
  })),
);
const ForgotPassword = lazy(() =>
  import('@/views/environments/client/auth/forgot-password').then((module) => ({
    default: module.ForgotPassword,
  })),
);
const ResetPassword = lazy(() =>
  import('@/views/environments/client/auth/reset-password').then((module) => ({
    default: module.ResetPassword,
  })),
);
const Dashboard = lazy(() =>
  import('@/views/environments/client/dashboard/page').then((module) => ({
    default: module.Dashboard,
  })),
);
const Certificates = lazy(() =>
  import('@/views/environments/client/certificates/page').then((module) => ({
    default: module.Certificates,
  })),
);
const News = lazy(() =>
  import('@/views/environments/client/news/page').then((module) => ({
    default: module.News,
  })),
);
const Employees = lazy(() =>
  import('@/views/environments/client/employees/page').then((module) => ({
    default: module.Employees,
  })),
);
const DateStep = lazy(() =>
  import('@/views/environments/client/appointment/date-step').then((module) => ({
    default: module.DateStep,
  })),
);
const EmployeeDataStep = lazy(() =>
  import('@/views/environments/client/appointment/employee-data-step').then((module) => ({
    default: module.EmployeeDataStep,
  })),
);
const TypeExamStep = lazy(() =>
  import('@/views/environments/client/appointment/type-exam-step').then((module) => ({
    default: module.TypeExamStep,
  })),
);
const ExamStep = lazy(() =>
  import('@/views/environments/client/appointment/exam-step').then((module) => ({
    default: module.ExamStep,
  })),
);
const Personal = lazy(() =>
  import('@/views/environments/client/profile/personal').then((module) => ({
    default: module.Personal,
  })),
);
const Security = lazy(() =>
  import('@/views/environments/client/profile/security').then((module) => ({
    default: module.Security,
  })),
);

function RouteLoading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm font-medium text-slate-400">
      Carregando...
    </div>
  );
}

function LazyElement({ children }: { children: ReactNode }) {
  return <Suspense fallback={<RouteLoading />}>{children}</Suspense>;
}

function AppointmentEntryRedirect() {
  const { entryPath, isLoading } = useAppointmentSettings();

  if (isLoading) {
    return <RouteLoading />;
  }

  return <Navigate to={entryPath} replace />;
}

export function Router() {
  return (
    <Routes>
      <Route element={<AuthGuard />}>
        <Route path="/login" element={<Navigate to="/auth" replace />} />
        <Route
          path="/auth"
          element={
            <LazyElement>
              <SignIn />
            </LazyElement>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <LazyElement>
              <ForgotPassword />
            </LazyElement>
          }
        />
        <Route
          path="/reset-password"
          element={
            <LazyElement>
              <ResetPassword />
            </LazyElement>
          }
        />
      </Route>

      <Route element={<Layout.Default />}>
        <Route element={<AuthGuard isPrivate />}>
          <Route
            path="/"
            element={
              <LazyElement>
                <Dashboard />
              </LazyElement>
            }
          />
          <Route
            path="/certificates"
            element={
              <LazyElement>
                <Certificates />
              </LazyElement>
            }
          />
          <Route
            path="/newsroom"
            element={
              <LazyElement>
                <News />
              </LazyElement>
            }
          />
          <Route
            path="/employees"
            element={
              <LazyElement>
                <Employees />
              </LazyElement>
            }
          />

          <Route
            path="/certificate"
            element={
              <AppointmentProvider>
                <Outlet />
              </AppointmentProvider>
            }>
            <Route index element={<AppointmentEntryRedirect />} />

            <Route
              path="date"
              element={
                <LazyElement>
                  <DateStep />
                </LazyElement>
              }
            />
            <Route
              path="employee"
              element={
                <LazyElement>
                  <EmployeeDataStep />
                </LazyElement>
              }
            />
            <Route
              path="type"
              element={
                <LazyElement>
                  <TypeExamStep />
                </LazyElement>
              }
            />
            <Route
              path="exam"
              element={
                <LazyElement>
                  <ExamStep />
                </LazyElement>
              }
            />
          </Route>

          <Route path="/profile" element={<Layout.Profile />}>
            <Route path="" element={<Navigate to="user-data" />} />

            <Route
              path="user-data"
              element={
                <LazyElement>
                  <Personal />
                </LazyElement>
              }
            />
            <Route
              path="security"
              element={
                <LazyElement>
                  <Security />
                </LazyElement>
              }
            />
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
  const { isAuth, isAuthReady } = useAuth();

  if (!isAuthReady) {
    return null;
  }

  if (!isAuth && isPrivate) {
    return <Navigate to="/auth" />;
  }

  if (isAuth && !isPrivate) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
