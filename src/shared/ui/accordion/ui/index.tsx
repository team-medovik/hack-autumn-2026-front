import { Content, Header, Item, Root, Trigger } from '@radix-ui/react-accordion';
import { clsx } from 'clsx';
import type { ReactNode } from 'react';

import { Icon } from '../../icon';
import { Text } from '../../text';

import './accordion.scss';

interface AccordionProps {
  /** Раскрытые при монтировании группы. Дальше — состояние самого аккордеона. */
  defaultValue?: string[];
  children: ReactNode;
  className?: string;
}

/**
 * Список раскрывающихся групп (Группа … в Figma). Можно раскрыть несколько сразу.
 * Дочерние элементы — `<AccordionItem>`.
 *
 * @example
 * <Accordion defaultValue={['awaiting']}>
 *   <AccordionItem value="awaiting" title="Ожидает оплаты" meta="1 услуга" aside="9,90 € / мес">
 *     …
 *   </AccordionItem>
 * </Accordion>
 */
export const Accordion = ({ defaultValue, children, className }: AccordionProps) => (
  <Root type="multiple" defaultValue={defaultValue} className={clsx('accordion', className)}>
    {children}
  </Root>
);

interface AccordionItemProps {
  value: string;
  title: ReactNode;
  /** Пояснение справа от заголовка, например «1 услуга». */
  meta?: ReactNode;
  /** Значение у правого края, например сумма «9,90 € / мес». */
  aside?: ReactNode;
  /** Уровень заголовка строки — по месту на странице. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  children: ReactNode;
}

/** Группа: строка-переключатель (шеврон, заголовок, пояснение, значение) и содержимое с отступом 24px. */
export const AccordionItem = ({
  value,
  title,
  meta,
  aside,
  headingLevel = 3,
  children,
}: AccordionItemProps) => {
  const Heading = `h${headingLevel}` as const;

  return (
    <Item value={value} className="accordion__item">
      <Header asChild>
        <Heading className="accordion__heading">
          <Trigger className="accordion__trigger">
            {/* Две иконки вместо поворота одной — ассеты из Figma как есть */}
            <Icon name="chevron-right-16" size={16} className="accordion__chevron-closed" />
            <Icon name="chevron-down-16" size={16} className="accordion__chevron-open" />
            <Text as="span" variant="caption" color="main" className="accordion__title">
              {title}
            </Text>
            {meta && (
              <Text as="span" variant="caption" color="secondary" className="accordion__meta">
                {meta}
              </Text>
            )}
            {aside && (
              <Text as="span" variant="caption" color="main" className="accordion__aside">
                {aside}
              </Text>
            )}
          </Trigger>
        </Heading>
      </Header>
      <Content className="accordion__content">
        <div className="accordion__body">{children}</div>
      </Content>
    </Item>
  );
};
