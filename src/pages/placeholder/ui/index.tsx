import { Link } from 'react-router-dom';

import { ROUTES } from '@/shared/config';
import { Button } from '@/shared/ui/button';
import { StatusScreen } from '@/shared/ui/status-screen';

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

/** Временная страница для разделов, у которых ещё нет макетов. */
export const PlaceholderPage = ({
  title,
  description = 'Раздел в разработке. Пока всё самое важное — на главной.',
}: PlaceholderPageProps) => (
  <StatusScreen
    title={title}
    description={description}
    action={
      <Button asChild variant="primary">
        <Link to={ROUTES.home}>На главную</Link>
      </Button>
    }
  />
);
