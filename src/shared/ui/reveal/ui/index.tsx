import { clsx } from 'clsx';
import { useRef, type ReactNode } from 'react';

import { RevealContext, useInView } from '@/shared/lib/reveal';

import './reveal.scss';

interface RevealProps {
  children: ReactNode;
  className?: string;
}

/**
 * Сам блок виден сразу, а анимации внутри стоят на первом кадре, пока его не прокрутили
 * до экрана: CSS-анимации на паузе (вместе с задержками «лесенки»), досчёт чисел ждёт
 * `useRevealed()`.
 *
 * @example
 * <Reveal className="home-page__card"><ChurnForecast data={data.churn} /></Reveal>
 */
export const Reveal = ({ children, className }: RevealProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);

  return (
    <div ref={ref} className={clsx('reveal', className)} data-revealed={inView || undefined}>
      <RevealContext value={inView}>{children}</RevealContext>
    </div>
  );
};
