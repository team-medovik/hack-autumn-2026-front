import { useLogoutAction } from '@/features/auth';
import { ROUTES } from '@/shared/config';
import { Button } from '@/shared/ui/button';
import { Logo } from '@/shared/ui/logo';
import { NavItem } from '@/shared/ui/nav-item';
import { Text } from '@/shared/ui/text';

import { SnapshotStatusText } from './snapshot-status-text';

import './navbar.scss';

/** Боковая навигация: название, свежесть данных, разделы, логотип и выход. */
export const Navbar = () => {
  const { mutate: logout, isPending } = useLogoutAction();

  return (
    <aside className="navbar">
      <div className="navbar__top">
        <div className="navbar__heading">
          <Text variant="heading-2" as="p" color="main">
            админ-панéль
          </Text>
          <SnapshotStatusText />
        </div>

        <nav className="navbar__nav" aria-label="Основные разделы">
          <NavItem to={ROUTES.home} icon="home" end>
            Дом
          </NavItem>
          <NavItem to={ROUTES.clients} icon="table">
            Сводная таблица
          </NavItem>
        </nav>
      </div>

      <div className="navbar__bottom">
        <nav className="navbar__nav" aria-label="Служебные разделы">
          <NavItem to={ROUTES.settings} icon="settings">
            Настройки
          </NavItem>
          <NavItem to={ROUTES.snapshot} icon="upload">
            Импорт/экспорт снимка
          </NavItem>
        </nav>
        <div className="navbar__footer">
          <Logo className="navbar__logo" />
          <Button variant="secondary" loading={isPending} onClick={() => logout()}>
            Выйти
          </Button>
        </div>
      </div>
    </aside>
  );
};
