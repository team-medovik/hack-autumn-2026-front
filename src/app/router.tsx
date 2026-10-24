import { createBrowserRouter } from 'react-router-dom';

import { GuestOnly, RequireAuth } from '@/features/auth';
import { AuthPage } from '@/pages/auth';
import { ClientCardPage } from '@/pages/client-card';
import { ClientsPage } from '@/pages/clients';
import { DemoPage } from '@/pages/demo';
import { HomePage } from '@/pages/home';
import { PlaceholderPage } from '@/pages/placeholder';
import { SettingsPage } from '@/pages/settings';
import { SnapshotPage } from '@/pages/snapshot';
import { CLIENT_ROUTE_PATTERN, ROUTES } from '@/shared/config';
import { Layout } from '@/widgets/layout';

export const router = createBrowserRouter([
  // Только для гостей: вход — отдельный экран без навбара, после входа редирект обратно
  {
    element: <GuestOnly />,
    children: [{ path: ROUTES.login, element: <AuthPage /> }],
  },
  // Только с сессией: без неё — редирект на /login
  {
    element: <RequireAuth />,
    children: [
      {
        path: ROUTES.home,
        element: <Layout />,
        children: [
          { index: true, element: <HomePage /> },
          {
            path: ROUTES.clients,
            element: <ClientsPage />,
            // Карточка — окно поверх таблицы, поэтому дочерний роут
            children: [{ path: CLIENT_ROUTE_PATTERN, element: <ClientCardPage /> }],
          },
          { path: ROUTES.settings, element: <SettingsPage /> },
          { path: ROUTES.snapshot, element: <SnapshotPage /> },
          { path: 'demo', element: <DemoPage /> },
          {
            path: '*',
            element: (
              <PlaceholderPage
                title="Страница не найдена"
                description="Такой страницы в панели нет."
              />
            ),
          },
        ],
      },
    ],
  },
]);
