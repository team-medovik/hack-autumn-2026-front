import { delay, http, HttpResponse } from 'msw';

import { isStrongPassword } from '@/shared/lib/password';

import { getMockPassword, resetMockPassword, setMockPassword } from './credentials';
import { readMockScenario } from '../scenario';

/**
 * Сценарии смены пароля — по макетам «Настройки — другое (…)»: /settings?mock=password-error
 * main            — смена работает, текущий пароль — Admin123 (по умолчанию)
 * password-error  — сервер не отвечает
 * Неверный текущий пароль — введите любой другой; сценарий не нужен.
 */
export const ACCOUNT_SCENARIOS = ['main', 'password-error'] as const;

interface ChangePasswordBody {
  currentPassword?: string;
  newPassword?: string;
}

export const resetAccountMock = resetMockPassword;

export const accountHandlers = [
  http.post('*/api/v1/account/password', async ({ request }) => {
    await delay();

    if (readMockScenario(ACCOUNT_SCENARIOS, 'main') === 'password-error') {
      return HttpResponse.json({ message: 'Service Unavailable' }, { status: 503 });
    }

    const { currentPassword, newPassword } = (await request.json()) as ChangePasswordBody;

    if (currentPassword !== getMockPassword()) {
      return HttpResponse.json(
        { status: 400, error: 'INVALID_CURRENT_PASSWORD', message: 'Неверный текущий пароль' },
        { status: 400 },
      );
    }
    if (!newPassword || !isStrongPassword(newPassword)) {
      return HttpResponse.json(
        { status: 422, error: 'WEAK_PASSWORD', message: 'Пароль не соответствует правилам' },
        { status: 422 },
      );
    }

    setMockPassword(newPassword);
    return new HttpResponse(null, { status: 204 });
  }),
];
