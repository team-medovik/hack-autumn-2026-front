import { clsx } from 'clsx';
import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';

import { Icon, type IconName } from '../../icon';

import './nav-item.scss';

interface NavItemProps {
  to: string;
  icon: IconName;
  children: ReactNode;
  /** Активен только при точном совпадении пути (для корня `/`). */
  end?: boolean;
  className?: string;
}

/**
 * Пункт навигации (Icon-button в Figma): текст слева, иконка справа.
 * Активный — фон control/default и основной цвет текста; ставит `aria-current="page"`.
 *
 * @example
 * <NavItem to="/" icon="home" end>Дом</NavItem>
 */
export const NavItem = ({ to, icon, children, end, className }: NavItemProps) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) => clsx('nav-item', { 'nav-item--active': isActive }, className)}
  >
    <span className="nav-item__text">{children}</span>
    <Icon name={icon} />
  </NavLink>
);
