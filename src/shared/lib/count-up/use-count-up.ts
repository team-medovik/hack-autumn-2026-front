import { useEffect, useRef, useState } from 'react';

const prefersReducedMotion = () =>
  typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** easeOutCubic: быстро набегает и плавно садится на итоговое значение. */
const easeOut = (progress: number) => 1 - (1 - progress) ** 3;

/**
 * Число, которое «досчитывает» до `target`: при первом показе — от нуля, дальше — от прошлого
 * значения. Последний кадр — ровно `target`. С `enabled: false` и при «уменьшении движения»
 * сразу отдаёт `target`. С `paused: true` стоит на стартовом значении — например, пока блок
 * не прокрутили до экрана.
 *
 * @example
 * const shown = useCountUp(monthlyLoss);
 * return <>{formatMoney(shown)}</>;
 */
export const useCountUp = (
  target: number,
  { durationMs = 900, enabled = true, paused = false } = {},
) => {
  const isStatic = !enabled || prefersReducedMotion();
  const [value, setValue] = useState(() => (isStatic ? target : 0));
  const from = useRef(value);

  useEffect(() => {
    if (!enabled || prefersReducedMotion()) {
      from.current = target;
      setValue(target);
      return;
    }
    if (paused) {
      return;
    }

    const start = from.current;
    let startedAt: number | undefined;
    let frame = requestAnimationFrame(function tick(now) {
      startedAt ??= now;
      const progress = Math.min(1, (now - startedAt) / durationMs);
      const next = progress === 1 ? target : start + (target - start) * easeOut(progress);
      from.current = next;
      setValue(next);
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    });

    return () => cancelAnimationFrame(frame);
  }, [target, durationMs, enabled, paused]);

  return isStatic ? target : value;
};
