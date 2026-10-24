import { Link } from 'react-router-dom';

import { useDashboard } from '@/entities/dashboard';
import { ROUTES } from '@/shared/config';
import { Button } from '@/shared/ui/button';
import { StatusScreen } from '@/shared/ui/status-screen';

import { DashboardGrid } from './dashboard-grid';

import './home-page.scss';

/**
 * Главная. Состояния по макетам «Дом (…)»:
 * загрузка — скелетоны в карточках; ошибка без данных и «нет снимков» — экран на всю панель;
 * данные есть — сетка виджетов (при потере связи остаётся на экране, навбар предупреждает).
 */
export const HomePage = () => {
  const { data, isError, isFetching, refetch } = useDashboard();

  if (!data) {
    return isError ? (
      <StatusScreen
        role="alert"
        title="Не удалось загрузить данные"
        description="Сервер не ответил. Проверьте соединение и попробуйте ещё раз"
        action={
          <Button variant="primary" loading={isFetching} onClick={() => void refetch()}>
            Повторить
          </Button>
        }
      />
    ) : (
      <DashboardGrid />
    );
  }

  if (!data.snapshot) {
    return (
      <StatusScreen
        title="Данных пока нет"
        description="Загрузите снимок данных из биллинга. Сводка, уровни риска и потери посчитаются сами."
        action={
          <Button asChild variant="primary">
            <Link to={ROUTES.snapshot}>Загрузить снимок</Link>
          </Button>
        }
      />
    );
  }

  return <DashboardGrid data={data} />;
};
