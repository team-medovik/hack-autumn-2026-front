import { useEffect, useState } from 'react';

import { api } from '@/shared/api';

const SSO_PROVIDER = 'keycloak';

/**
 * Адрес входа через SSO. OIDC Authorization Code flow целиком на бэкенде: он редиректит на Keycloak,
 * а после возврата выставляет cookie refresh_token и отправляет браузер обратно в приложение.
 * getUri собирает адрес так же, как axios собирает запросы к API (с учётом baseURL).
 */
export const getSsoLoginUrl = () => api.getUri({ url: `/api/v1/auth/oidc/${SSO_PROVIDER}/login` });

/**
 * Вход через SSO — полная навигация браузера, не XHR: редиректы на Keycloak должен пройти сам браузер.
 * Сессию после возврата поднимает обычный /refresh при старте приложения (см. app/main.tsx).
 *
 * @example
 * const { startSsoLogin, isRedirecting } = useSsoLogin();
 * <Button onClick={startSsoLogin} loading={isRedirecting}>Вход через SSO</Button>
 */
export const useSsoLogin = () => {
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Кнопка «назад» с Keycloak может вернуть страницу из bfcache — с застрявшим лоадером
  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        setIsRedirecting(false);
      }
    };
    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
  }, []);

  const startSsoLogin = () => {
    setIsRedirecting(true);
    window.location.assign(getSsoLoginUrl());
  };

  return { startSsoLogin, isRedirecting };
};
