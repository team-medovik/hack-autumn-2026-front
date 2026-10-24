import { describe, expect, it } from 'vitest';

import { generatePassword } from './generate-password';

describe('generatePassword', () => {
  it('выдаёт три группы через дефис, как «Kq7-vT2m-9xLp»', () => {
    expect(generatePassword()).toMatch(/^[A-Za-z0-9]{3}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}$/);
  });

  it('всегда содержит строчную, заглавную и цифру и не содержит похожих символов', () => {
    for (let i = 0; i < 200; i += 1) {
      const password = generatePassword();
      expect(password).toMatch(/[a-z]/);
      expect(password).toMatch(/[A-Z]/);
      expect(password).toMatch(/\d/);
      expect(password).not.toMatch(/[01lIO]/);
    }
  });

  it('не повторяется', () => {
    const passwords = new Set(Array.from({ length: 50 }, generatePassword));
    expect(passwords.size).toBe(50);
  });
});
