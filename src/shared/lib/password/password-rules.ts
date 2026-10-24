/** Правила нового пароля — те же, что держит сервер: от 8 символов, строчная, заглавная, цифра. */
export const PASSWORD_RULES = 'От 8 символов: строчная и заглавная буквы и цифра';

const MIN_LENGTH = 8;
const MAX_LENGTH = 255;

export const isStrongPassword = (password: string) =>
  password.length >= MIN_LENGTH &&
  password.length <= MAX_LENGTH &&
  /[a-zа-яё]/.test(password) &&
  /[A-ZА-ЯЁ]/.test(password) &&
  /\d/.test(password);
