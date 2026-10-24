import type { ClientCardBalance } from '../model/card-types';

/** Сколько не хватает на продления. `null` — продлевать нечего. */
export const getShortage = ({ available, required }: ClientCardBalance) =>
  required === null ? null : Math.max(0, required - available);
