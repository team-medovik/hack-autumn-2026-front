/** Пути приложения. Единый источник для роутера и ссылок. */
export const ROUTES = {
  home: '/',
  login: '/login',
  clients: '/clients',
  client: (id: string) => `/clients/${encodeURIComponent(id)}`,
  settings: '/settings',
  snapshot: '/snapshot',
} as const;

/** Шаблон пути карточки клиента для роутера. */
export const CLIENT_ROUTE_PATTERN = '/clients/:clientId';
