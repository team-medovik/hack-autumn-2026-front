import type { ReactNode } from 'react';
import { Toaster } from 'sonner';

import { QueryProvider } from './query-provider';
import { ThemeProvider } from './theme-provider';

interface AppProvidersProps {
  children: ReactNode;
}

/** Глобальные провайдеры: тема, TanStack Query и контейнер toast-уведомлений. */
export const AppProviders = ({ children }: AppProvidersProps) => (
  <ThemeProvider>
    <QueryProvider>
      {children}
      {/* Контейнер toast-уведомлений — sonner */}
      <Toaster richColors position="bottom-right" />
    </QueryProvider>
  </ThemeProvider>
);
