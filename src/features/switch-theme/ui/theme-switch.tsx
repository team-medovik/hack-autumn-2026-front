import { useTheme, type ThemeMode } from '@/shared/lib/theme';
import { ToggleGroup, type ToggleGroupItem } from '@/shared/ui/toggle-group';

const THEME_ITEMS: readonly ToggleGroupItem<ThemeMode>[] = [
  { value: 'system', label: 'Как в системе' },
  { value: 'light', label: 'Светлая' },
  { value: 'dark', label: 'Тёмная' },
];

/** Выбор темы: как в системе, светлая, тёмная. Запоминается в этом браузере. */
export const ThemeSwitch = () => {
  const { mode, setMode } = useTheme();

  return <ToggleGroup aria-label="Тема" items={THEME_ITEMS} value={mode} onValueChange={setMode} />;
};
