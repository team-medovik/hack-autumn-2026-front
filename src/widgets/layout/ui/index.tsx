import { Outlet } from 'react-router-dom';

import { Navbar } from './navbar';

import './layout.scss';

/**
 * Каркас приложения: навбар слева и область контента (панель bg/panel).
 * Страница рендерится в `<main>` через `<Outlet />`.
 */
export const Layout = () => (
  <div className="layout">
    <Navbar />
    <main data-layer="panel" className="layout__main">
      <Outlet />
    </main>
  </div>
);
