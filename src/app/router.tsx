import { createBrowserRouter } from 'react-router-dom';

import { GuestOnly, RequireAuth } from '@/features/auth';
import { CLIENT_ROUTE_PATTERN, ROUTES } from '@/shared/config';
import { Layout } from '@/widgets/layout';

import { RealtimeUpdates } from './realtime';

// Страницы грузятся отдельными чанками при первом переходе: на входе не тянем
// настройки, импорт снимков и карточку клиента. Пока чанк грузится, остаётся прошлая страница.
export const router = createBrowserRouter([
  // Только для гостей: вход — отдельный экран без навбара, после входа редирект обратно
  {
    element: <GuestOnly />,
    children: [
      {
        path: ROUTES.login,
        lazy: () => import('@/pages/auth').then((m) => ({ Component: m.AuthPage })),
      },
    ],
  },
  // Только с сессией: без неё — редирект на /login
  {
    element: <RequireAuth />,
    children: [
      {
        path: ROUTES.home,
        // Изменения от других администраторов приходят, пока открыта панель
        element: (
          <>
            <RealtimeUpdates />
            <Layout />
          </>
        ),
        children: [
          {
            index: true,
            lazy: () => import('@/pages/home').then((m) => ({ Component: m.HomePage })),
          },
          {
            path: ROUTES.clients,
            lazy: () => import('@/pages/clients').then((m) => ({ Component: m.ClientsPage })),
            // Карточка — окно поверх таблицы, поэтому дочерний роут
            children: [
              {
                path: CLIENT_ROUTE_PATTERN,
                lazy: () =>
                  import('@/pages/client-card').then((m) => ({ Component: m.ClientCardPage })),
              },
            ],
          },
          {
            path: ROUTES.settings,
            lazy: () => import('@/pages/settings').then((m) => ({ Component: m.SettingsPage })),
          },
          {
            path: ROUTES.snapshot,
            lazy: () => import('@/pages/snapshot').then((m) => ({ Component: m.SnapshotPage })),
          },
          {
            path: '*',
            lazy: () => import('@/pages/not-found').then((m) => ({ Component: m.NotFoundPage })),
          },
        ],
      },
    ],
  },
]);
