// Без похожих символов (0/O, 1/l/I) — пароль диктуют и переписывают руками
const LOWER = 'abcdefghijkmnopqrstuvwxyz';
const UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const DIGITS = '23456789';
const ALPHABET = LOWER + UPPER + DIGITS;

/** Группы через дефис, как в макете: «Kq7-vT2m-9xLp» — 11 символов без дефисов. */
const GROUPS = [3, 4, 4];
const LENGTH = GROUPS.reduce((sum, size) => sum + size, 0);

/** Случайное целое в [0, max) без перекоса по модулю. */
const randomIndex = (max: number) => {
  const limit = Math.floor(0x1_0000_0000 / max) * max;
  const buffer = new Uint32Array(1);
  do {
    crypto.getRandomValues(buffer);
  } while (buffer[0] >= limit);
  return buffer[0] % max;
};

const pick = (chars: string) => chars[randomIndex(chars.length)];

const isStrong = (chars: readonly string[]) =>
  [LOWER, UPPER, DIGITS].every((set) => chars.some((char) => set.includes(char)));

/**
 * Случайный пароль для нового пользователя: «Kq7-vT2m-9xLp». Есть строчная, заглавная и цифра —
 * проходит правила формы входа (заглавная, строчная, цифра, от 8 символов).
 */
export const generatePassword = () => {
  let chars: string[];
  do {
    chars = Array.from({ length: LENGTH }, () => pick(ALPHABET));
  } while (!isStrong(chars));

  let offset = 0;
  return GROUPS.map((size) => {
    const group = chars.slice(offset, offset + size).join('');
    offset += size;
    return group;
  }).join('-');
};
