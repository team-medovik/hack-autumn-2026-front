import { clsx } from 'clsx';
import type { ComponentProps } from 'react';

import './text-button.scss';

/**
 * Кнопка-ссылка: подчёркнутый Caption без фона (в Figma — «Как посчитано»).
 * Для второстепенных действий рядом с данными, когда полноценная кнопка слишком громкая.
 *
 * @example
 * <TextButton onClick={openExplanation}>Как посчитано</TextButton>
 */
export const TextButton = ({ type = 'button', className, ...props }: ComponentProps<'button'>) => (
  <button type={type} className={clsx('text-button', className)} {...props} />
);
