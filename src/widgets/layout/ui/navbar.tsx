import { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { LogoutButton } from '@/features/auth';
import { ROUTES } from '@/shared/config';
import { Logo } from '@/shared/ui/logo';
import { NavItem } from '@/shared/ui/nav-item';
import { Text } from '@/shared/ui/text';

import { SnapshotStatusText } from './snapshot-status-text';

import './navbar.scss';

/** Боковая навигация: название, свежесть данных, разделы, логотип и выход. */
export const Navbar = () => {
  const sectionsRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();

  // На узком экране разделы — лента с прокруткой вбок: активный пункт не должен прятаться за краем
  useEffect(() => {
    const sections = sectionsRef.current;
    const active = sections?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!sections || !active || sections.scrollWidth <= sections.clientWidth) {
      return;
    }

    const { left, right } = active.getBoundingClientRect();
    const bounds = sections.getBoundingClientRect();
    if (left < bounds.left || right > bounds.right) {
      const inset = parseFloat(getComputedStyle(sections).paddingLeft);
      sections.scrollTo({
        left: sections.scrollLeft + left - bounds.left - inset,
        behavior: 'smooth',
      });
    }
  }, [pathname]);

  return (
    <aside className="navbar">
      {/* Название и свежесть данных ведут на главную, как логотип сайта */}
      <Link to={ROUTES.home} className="navbar__heading">
        <Text variant="heading-2" as="p" color="main">
          админ-панéль
        </Text>
        <SnapshotStatusText />
      </Link>

      {/* Десктоп: основные разделы сверху, служебные прижаты вниз. Узкий экран: все в одну ленту */}
      <div ref={sectionsRef} className="navbar__sections">
        <nav className="navbar__nav" aria-label="Основные разделы">
          <NavItem to={ROUTES.home} icon="home" end>
            Дом
          </NavItem>
          <NavItem to={ROUTES.clients} icon="table">
            Сводная таблица
          </NavItem>
        </nav>
        <nav className="navbar__nav" aria-label="Служебные разделы">
          <NavItem to={ROUTES.settings} icon="settings">
            Настройки
          </NavItem>
          <NavItem to={ROUTES.snapshot} icon="upload">
            Импорт/экспорт снимка
          </NavItem>
        </nav>
      </div>

      <div className="navbar__footer">
        <Logo className="navbar__logo" />
        <LogoutButton />
      </div>
    </aside>
  );
};
