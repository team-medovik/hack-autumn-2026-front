const MIN_LENGTH = 8;
const MAX_LENGTH = 255;

/** Правила нового пароля — те же, что держит сервер: от 8 символов, строчная, заглавная, цифра. */
export const PASSWORD_RULES = `От ${MIN_LENGTH} символов: строчная и заглавная буквы и цифра`;

const PASSWORD_TOO_LONG = `Пароль — до ${MAX_LENGTH} символов`;

const hasRequiredChars = (password: string) =>
  /[a-zа-яё]/.test(password) && /[A-ZА-ЯЁ]/.test(password) && /\d/.test(password);

/**
 * Что не так с новым паролем: перебор длины — только про длину, иначе — правила целиком.
 * `null` — пароль подходит.
 */
export const getPasswordError = (password: string): string | null => {
  if (password.length > MAX_LENGTH) {
    return PASSWORD_TOO_LONG;
  }
  return password.length >= MIN_LENGTH && hasRequiredChars(password) ? null : PASSWORD_RULES;
};

export const isStrongPassword = (password: string) => getPasswordError(password) === null;
