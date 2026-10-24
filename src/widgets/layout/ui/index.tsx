import { useLayoutEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { scrollToTop } from '@/shared/lib/scroll';

import { Navbar } from './navbar';

import './layout.scss';

/**
 * Каркас приложения: навбар слева и область контента (панель bg/panel).
 * Страница рендерится в `<main>` через `<Outlet />`.
 */
export const Layout = () => {
  // Ключ — раздел, а не полный путь: карточка клиента поверх таблицы не перезапускает появление
  const section = useLocation().pathname.split('/')[1];

  // Новый раздел открывается с начала, а не с прокрутки прошлого
  useLayoutEffect(() => {
    scrollToTop();
  }, [section]);

  return (
    <div className="layout">
      <Navbar />
      <main data-layer="panel" className="layout__main">
        <div key={section} className="layout__page">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
