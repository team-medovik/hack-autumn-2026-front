import { clsx } from 'clsx';
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type ReactNode,
} from 'react';

import './dropzone.scss';

interface DropzoneProps {
  /** Файл бросили в зону или выбрали в системном диалоге. Из нескольких берётся первый. */
  onFile: (file: File) => void;
  /** Фильтр системного диалога, как у `<input accept>`: «.json,application/json». */
  accept?: string;
  /**
   * Приглашение в обычном состоянии. Оно же задаёт высоту зоны: другие состояния рисуются
   * поверх, и зона не скачет. Кнопка внутри — для клавиатуры: её клик открывает диалог.
   */
  children: ReactNode;
  /** Что показать вместо приглашения той же высоты: загрузку, ошибку. */
  content?: ReactNode;
  /** Содержимое, пока над зоной держат файл: «Отпустите, чтобы загрузить файл». */
  dropHint: ReactNode;
  /** Ошибка: красный пунктир. */
  invalid?: boolean;
  /** Зона не принимает файлы и не открывает диалог (идёт загрузка). */
  disabled?: boolean;
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
 * Зона загрузки файла (слой «Загрузка» в Figma): пунктир 8/8, при наведении файла — заливка
 * accent и `dropHint`. Клик в любом месте зоны открывает системный выбор файла.
 *
 * @example
 * <Dropzone accept=".json" onFile={upload} dropHint={<StateMessage title="Отпустите…" />}
 *   content={isUploading ? <UploadProgress … /> : undefined}>
 *   <StateMessage title="Перетащите файл" action={<Button>Выбрать файл</Button>} />
 * </Dropzone>
 */
export const Dropzone = ({
  onFile,
  accept,
  children,
  content,
  dropHint,
  invalid = false,
  disabled = false,
  'aria-label': ariaLabel,
  className,
}: DropzoneProps) => {
  useBlockWindowFileDrop();
  const input = useRef<HTMLInputElement>(null);
  const [isOver, setIsOver] = useState(false);
  // dragenter/dragleave приходят и от вложенных элементов — считаем глубину
  const depth = useRef(0);

  const isActive = isOver && !disabled;
  const overlay = isActive ? dropHint : content;

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
    depth.current = 0;
    setIsOver(false);
    const file = event.dataTransfer.files.item(0);
    if (!disabled && file) {
      onFile(file);
    }
  };

  const handlePick = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.item(0);
    // Сбрасываем, чтобы повторный выбор того же файла снова вызвал change
    event.target.value = '';
    if (file) {
      onFile(file);
    }
  };

  return (
    <section
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
      className={clsx(
        'dropzone',
        {
          'dropzone--over': isActive,
          'dropzone--invalid': invalid && !isActive,
          'dropzone--disabled': disabled,
        },
        className,
      )}
      // Клик по кнопке внутри всплывает сюда же — диалог открывается один раз
      onClick={() => !disabled && input.current?.click()}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <svg className="dropzone__border" aria-hidden>
        <rect />
      </svg>
      <input
        ref={input}
        type="file"
        accept={accept}
        disabled={disabled}
        hidden
        tabIndex={-1}
        onChange={handlePick}
        // Клик, который мы сами вызвали, не должен снова всплыть в зону
        onClick={(event) => event.stopPropagation()}
      />
      {/* Под другим состоянием приглашение невидимо и недоступно, но держит высоту */}
      <div className={clsx('dropzone__layer', { 'dropzone__layer--sizer': overlay !== undefined })}>
        {children}
      </div>
      {overlay !== undefined && <div className="dropzone__layer">{overlay}</div>}
    </section>
  );
};
