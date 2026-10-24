import { useRef, type ChangeEvent, type ComponentProps } from 'react';

import { Button } from '../../button';

type FilePickerButtonProps = Omit<ComponentProps<typeof Button>, 'onClick' | 'asChild' | 'type'> & {
  /** Выбрали файл. Тот же файл можно выбрать повторно — событие придёт снова. */
  onPick: (file: File) => void;
  /** Фильтр диалога выбора, как у `<input accept>`: «.json,application/json». */
  accept?: string;
};

/**
 * Кнопка, открывающая системный диалог выбора файла. Скрытый `<input type="file">` — внутри.
 *
 * @example
 * <FilePickerButton variant="primary" accept=".json" onPick={upload}>Выбрать файл</FilePickerButton>
 */
export const FilePickerButton = ({ onPick, accept, disabled, ...props }: FilePickerButtonProps) => {
  const input = useRef<HTMLInputElement>(null);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.item(0);
    // Сбрасываем, чтобы повторный выбор того же файла снова вызвал change
    event.target.value = '';
    if (file) {
      onPick(file);
    }
  };

  return (
    <>
      <input
        ref={input}
        type="file"
        accept={accept}
        disabled={disabled}
        hidden
        tabIndex={-1}
        onChange={handleChange}
      />
      <Button disabled={disabled} onClick={() => input.current?.click()} {...props} />
    </>
  );
};
