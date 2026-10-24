import { Content, List, Root, Trigger } from '@radix-ui/react-tabs';
import { clsx } from 'clsx';
import type { ReactNode } from 'react';

import { Button } from '../../button';

import './tabs.scss';

interface TabsProps<T extends string> {
  value: T;
  onValueChange: (value: T) => void;
  children: ReactNode;
  className?: string;
}

/**
 * Вкладки (Radix Tabs): `TabList` с `Tab`, под ними `TabPanel`. Клавиатура — стрелками.
 *
 * @example
 * <Tabs value={tab} onValueChange={setTab}>
 *   <TabList aria-label="Разделы настроек">
 *     <Tab value="model">Модель</Tab>
 *   </TabList>
 *   <TabPanel value="model">…</TabPanel>
 * </Tabs>
 */
export const Tabs = <T extends string>({
  value,
  onValueChange,
  children,
  className,
}: TabsProps<T>) => (
  <Root
    value={value}
    // Radix отдаёт строку; значения — только наши `Tab value`
    onValueChange={(next) => onValueChange(next as T)}
    className={clsx('tabs', className)}
  >
    {children}
  </Root>
);

interface TabListProps {
  children: ReactNode;
  'aria-label': string;
  className?: string;
}

/** Ряд вкладок через 4px. */
export const TabList = ({ children, 'aria-label': ariaLabel, className }: TabListProps) => (
  <List aria-label={ariaLabel} className={clsx('tabs__list', className)}>
    {children}
  </List>
);

interface TabProps {
  value: string;
  children: ReactNode;
  disabled?: boolean;
}

/** Вкладка — Вторичная кнопка Figma, выбранная — в состоянии «Активное». */
export const Tab = ({ value, children, disabled }: TabProps) => (
  <Trigger value={value} disabled={disabled} asChild>
    <Button variant="secondary" className="tabs__tab">
      {children}
    </Button>
  </Trigger>
);

interface TabPanelProps {
  value: string;
  children: ReactNode;
  /** Не размонтировать скрытую панель — сохранить её состояние (например, черновик формы). */
  keepMounted?: boolean;
  className?: string;
}

export const TabPanel = ({ value, children, keepMounted = false, className }: TabPanelProps) => (
  <Content
    value={value}
    forceMount={keepMounted || undefined}
    className={clsx('tabs__panel', className)}
  >
    {children}
  </Content>
);
