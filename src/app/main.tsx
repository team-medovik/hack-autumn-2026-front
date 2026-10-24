import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';

import { refreshSession } from '@/features/auth';
import { env } from '@/shared/config';

import './setup-api';
import { AppProviders } from './providers';
import { router } from './router';

import './index.css';
import './layout-guides.scss';

const root = document.getElementById('root');
if (!root) {
  throw new Error('Элемент #root не найден. Проверьте index.html.');
}

// Удалить статичный прелоадер после монтирования React
const removePreloader = () => {
  const preloader = document.getElementById('app-preloader');
  if (preloader) {
    preloader.classList.add('hidden');
    setTimeout(() => preloader.remove(), 400);
  }
};

/**
 * MSW перехватывает только описанные в моках запросы, остальные уходят на бэкенд.
 * Воркер нужно дождаться до первого запроса (/refresh ниже), иначе он уйдёт мимо моков.
 */
const enableMocks = async () => {
  if (!env.enableMocks) {
    return;
  }
  const { worker } = await import('./mocks/browser');
  await worker.start({ onUnhandledRequest: 'bypass' });
};

// Если воркер не поднялся (нет public/mockServiceWorker.js), приложение всё равно запускается
void enableMocks()
  .catch((error: unknown) => console.error('MSW не запустился, запросы идут на бэкенд', error))
  .then(() => {
    // Восстанавливаем сессию по cookie: статус unknown → authenticated / anonymous
    void refreshSession();

    createRoot(root).render(
      <StrictMode>
        <AppProviders>
          <RouterProvider router={router} />
        </AppProviders>
      </StrictMode>,
    );

    removePreloader();
  });
