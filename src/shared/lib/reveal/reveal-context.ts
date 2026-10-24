import { createContext, useContext } from 'react';

/** Блок `<Reveal>` уже на экране. Вне `<Reveal>` — `true`: анимации идут сразу. */
export const RevealContext = createContext(true);

/** Показан ли ближайший `<Reveal>`: JS-анимации (досчёт чисел) ждут этого момента. */
export const useRevealed = () => useContext(RevealContext);
