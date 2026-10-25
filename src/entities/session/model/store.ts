import { useShallow } from 'zustand/shallow';

import type { AuthenticationResponse, CurrentUserResponse } from '@/shared/api';
import { createStore } from '@/shared/lib/zustand';

// ─── Типы ─────────────────────────────────────────────────────────────────────

/**
 * - `unknown` — приложение только загрузилось, сессия ещё не проверена (/refresh не вызывался)
 * - `authenticated` — есть access-токен
 * - `anonymous` — проверили, сессии нет (или вышли)
 */
export type SessionStatus = 'unknown' | 'authenticated' | 'anonymous';

interface SessionState {
  accessToken: string | null;
  /** Момент истечения access-токена, мс (Date.now()-шкала). */
  expiresAt: number | null;
  user: CurrentUserResponse | null;
  status: SessionStatus;
}

interface SessionActions {
  /** Сохранить ответ /login или /refresh. */
  setSession: (response: AuthenticationResponse) => void;
  setUser: (user: CurrentUserResponse) => void;
  /** Выход или неудачный /refresh. */
  clearSession: () => void;
}

type SessionStore = SessionState & SessionActions;

// ─── Стор ─────────────────────────────────────────────────────────────────────
//
// Access-токен живёт только в памяти: не в localStorage, чтобы его не мог прочитать XSS.
// Сессия переживает перезагрузку за счёт HttpOnly-cookie refresh_token:
// при старте приложения вызывается /refresh, ответ кладётся через setSession.

export const useSessionStore = createStore<SessionStore>('Session', (set) => ({
  accessToken: null,
  expiresAt: null,
  user: null,
  status: 'unknown',

  setSession: ({ accessToken, expiresIn, user }) =>
    set((draft) => {
      draft.accessToken = accessToken ?? null;
      draft.expiresAt = expiresIn ? Date.now() + expiresIn * 1000 : null;
      if (user) {
        draft.user = user;
      }
      draft.status = accessToken ? 'authenticated' : 'anonymous';
    }),

  setUser: (user) =>
    set((draft) => {
      draft.user = user;
    }),

  clearSession: () =>
    set((draft) => {
      draft.accessToken = null;
      draft.expiresAt = null;
      draft.user = null;
      draft.status = 'anonymous';
    }),
}));

// ─── Хуки-селекторы ───────────────────────────────────────────────────────────

export const useSessionStatus = () => useSessionStore((s) => s.status);

export const useSessionUser = () => useSessionStore((s) => s.user);

/** Вошёл администратор — ему доступно управление сотрудниками. */
export const useIsAdmin = () => useSessionStore((s) => s.user?.role === 'ADMIN');

export const useSessionActions = () =>
  useSessionStore(
    useShallow((s) => ({
      setSession: s.setSession,
      setUser: s.setUser,
      clearSession: s.clearSession,
    })),
  );

// ─── Вне React ────────────────────────────────────────────────────────────────

/** Текущий access-токен — для axios-интерсептора и прочего кода вне компонентов. */
export const getAccessToken = () => useSessionStore.getState().accessToken;
