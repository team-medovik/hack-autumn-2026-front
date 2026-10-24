import { useEffect, useState, type RefObject } from 'react';

/**
 * Элемент хотя бы раз попал в окно. Срабатывает однократно: прокрутили обратно — остаётся `true`.
 * Без IntersectionObserver (старые браузеры, jsdom) — сразу `true`.
 *
 * @example
 * const ref = useRef<HTMLDivElement>(null);
 * const inView = useInView(ref);
 */
export const useInView = (
  ref: RefObject<Element | null>,
  // Нижние 15% окна не считаются: блок оживает, когда показался целиком, а не краешком
  { rootMargin = '0px 0px -15% 0px' }: { rootMargin?: string } = {},
) => {
  const [inView, setInView] = useState(() => typeof IntersectionObserver === 'undefined');

  useEffect(() => {
    const element = ref.current;
    if (inView || !element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, inView, rootMargin]);

  return inView;
};
