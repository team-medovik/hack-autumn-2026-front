import { Navigate, Outlet, useLocation, type Location } from 'react-router-dom';

import { useSessionStatus } from '@/entities/session';
import { ROUTES } from '@/shared/config';
import { Icon } from '@/shared/ui/icon';

import './session-guards.scss';

/** Пока сессия проверяется (/refresh при старте) — не мигаем формой входа. */
const SessionLoader = () => (
  <div className="session-loader" role="status" aria-label="Проверка сессии">
    <Icon name="loading" />
  </div>
);

/**
 * Защищённые роуты: без сессии — на /login, запомнив, куда шёл пользователь.
 *
 * @example
 * { element: <RequireAuth />, children: [{ index: true, element: <HomePage /> }] }
 */
export const RequireAuth = () => {
  const status = useSessionStatus();
  const location = useLocation();

  if (status === 'unknown') {
    return <SessionLoader />;
  }

  if (status === 'anonymous') {
    return <Navigate to={ROUTES.login} replace state={{ from: location }} />;
  }

  return <Outlet />;
};

/** Роуты только для гостей (/login): после входа — обратно туда, откуда пришли, или на главную. */
export const GuestOnly = () => {
  const status = useSessionStatus();
  const location = useLocation();

  if (status === 'unknown') {
    return <SessionLoader />;
  }

  if (status === 'authenticated') {
    const from = (location.state as { from?: Location } | null)?.from;
    return <Navigate to={from ?? ROUTES.home} replace />;
  }

  return <Outlet />;
};
