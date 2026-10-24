import { describe, expect, it } from 'vitest';

import { generatePassword } from './generate-password';
import { isStrongPassword } from './password-rules';

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
