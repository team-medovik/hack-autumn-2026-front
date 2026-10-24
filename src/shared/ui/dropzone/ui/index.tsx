import { clsx } from 'clsx';
import { useEffect, useRef, useState, type DragEvent, type ReactNode } from 'react';

import './dropzone.scss';

interface DropzoneProps {
  /** Файл бросили в зону. Из нескольких берётся первый. */
  onDrop: (file: File) => void;
  /** Содержимое, пока над зоной держат файл: «Отпустите, чтобы загрузить файл». */
  dropHint: ReactNode;
  /** Ошибка: красная пунктирная рамка. */
  invalid?: boolean;
  /** Зона не принимает файлы (идёт загрузка). */
  disabled?: boolean;
  children: ReactNode;
  'aria-label'?: string;
  className?: string;
}

const hasFiles = (event: Pick<globalThis.DragEvent, 'dataTransfer'>) =>
  event.dataTransfer?.types.includes('Files') ?? false;

/** Промахнулись мимо зоны — браузер открыл бы файл вместо страницы. Гасим, пока зона на экране. */
const useBlockWindowFileDrop = () => {
  useEffect(() => {
    const block = (event: globalThis.DragEvent) => {
      if (hasFiles(event)) {
        event.preventDefault();
      }
    };
    window.addEventListener('dragover', block);
    window.addEventListener('drop', block);
    return () => {
      window.removeEventListener('dragover', block);
      window.removeEventListener('drop', block);
    };
  }, []);
};

/**
 * Зона перетаскивания файла (слой «Загрузка» в Figma): пунктирная рамка, при наведении файла —
 * заливка accent и `dropHint`. Выбор с клавиатуры — кнопкой внутри (`FilePickerButton`).
 *
 * @example
 * <Dropzone onDrop={upload} dropHint={<StateMessage title="Отпустите…" />}>
 *   <StateMessage title="Перетащите файл" action={<FilePickerButton onPick={upload}>…} />
 * </Dropzone>
 */
export const Dropzone = ({
  onDrop,
  dropHint,
  invalid = false,
  disabled = false,
  children,
  'aria-label': ariaLabel,
  className,
}: DropzoneProps) => {
  useBlockWindowFileDrop();
  const [isOver, setIsOver] = useState(false);
  // dragenter/dragleave приходят и от вложенных элементов — считаем глубину
  const depth = useRef(0);

  const reset = () => {
    depth.current = 0;
    setIsOver(false);
  };

  const handleDragEnter = (event: DragEvent) => {
    if (disabled || !hasFiles(event)) {
      return;
    }
    depth.current += 1;
    setIsOver(true);
  };

  const handleDragLeave = () => {
    depth.current = Math.max(0, depth.current - 1);
    if (depth.current === 0) {
      setIsOver(false);
    }
  };

  const handleDragOver = (event: DragEvent) => {
    if (!hasFiles(event)) {
      return;
    }
    // Без preventDefault браузер откроет файл вместо drop
    event.preventDefault();
    event.dataTransfer.dropEffect = disabled ? 'none' : 'copy';
  };

  const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    reset();
    const file = event.dataTransfer.files.item(0);
    if (!disabled && file) {
      onDrop(file);
    }
  };

  const isActive = isOver && !disabled;

  return (
    <section
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
      className={clsx(
        'dropzone',
        { 'dropzone--over': isActive, 'dropzone--invalid': invalid && !isActive },
        className,
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {isActive ? dropHint : children}
    </section>
  );
};
