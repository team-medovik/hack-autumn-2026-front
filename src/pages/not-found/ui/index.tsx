import { Link } from 'react-router-dom';

import { ROUTES } from '@/shared/config';
import { Button } from '@/shared/ui/button';
import { StatusScreen } from '@/shared/ui/status-screen';

/** Неизвестный адрес внутри панели. */
export const NotFoundPage = () => (
  <StatusScreen
    title="Страница не найдена"
    description="Такой страницы в панели нет."
    action={
      <Button asChild variant="primary">
        <Link to={ROUTES.home}>На главную</Link>
      </Button>
    }
  />
);
