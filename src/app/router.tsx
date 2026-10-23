import { createBrowserRouter } from 'react-router-dom';

import { DemoPage } from '@/pages/demo';
import { HomePage } from '@/pages/home';
import { Layout } from '@/widgets/layout';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'demo', element: <DemoPage /> },
    ],
  },
]);
