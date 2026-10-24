import { createBrowserRouter } from 'react-router-dom';

import { GuestOnly, RequireAuth } from '@/features/auth';
import { AuthPage } from '@/pages/auth';
import { ClientsPage } from '@/pages/clients';
import { DemoPage } from '@/pages/demo';
import { HomePage } from '@/pages/home';
import { PlaceholderPage } from '@/pages/placeholder';
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
          { path: ROUTES.clients, element: <ClientsPage /> },
          { path: CLIENT_ROUTE_PATTERN, element: <PlaceholderPage title="Карточка клиента" /> },
          { path: ROUTES.settings, element: <PlaceholderPage title="Настройки" /> },
          { path: ROUTES.snapshot, element: <PlaceholderPage title="Импорт и экспорт снимка" /> },
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
