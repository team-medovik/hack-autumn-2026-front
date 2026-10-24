import { describe, expect, it } from 'vitest';

import { generatePassword } from './generate-password';
import { getPasswordError, isStrongPassword, PASSWORD_RULES } from './password-rules';

describe('isStrongPassword', () => {
  it('требует 8 символов, строчную, заглавную и цифру', () => {
    expect(isStrongPassword('Admin123')).toBe(true);
    expect(isStrongPassword('Adm123')).toBe(false);
    expect(isStrongPassword('admin123')).toBe(false);
    expect(isStrongPassword('ADMIN123')).toBe(false);
    expect(isStrongPassword('Adminadmin')).toBe(false);
  });

  it('принимает сгенерированный пароль', () => {
    expect(isStrongPassword(generatePassword())).toBe(true);
  });
});

describe('getPasswordError', () => {
  it('при переборе длины говорит только про длину', () => {
    expect(getPasswordError(`Aa1${'a'.repeat(253)}`)).toBe('Пароль — до 255 символов');
  });

  it('иначе — правила пароля', () => {
    expect(getPasswordError('short')).toBe(PASSWORD_RULES);
    expect(getPasswordError('Admin123')).toBeNull();
  });
});
