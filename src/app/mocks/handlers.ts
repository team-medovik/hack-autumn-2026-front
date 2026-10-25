import { accountHandlers } from './account';
import { clientsHandlers } from './clients';
import { dashboardHandlers } from './dashboard';
import { dataSourceHandlers } from './data-source';
import { realtimeHandlers } from './realtime';
import { calculationDateHandlers, settingsHandlers } from './settings';
import { snapshotsHandlers } from './snapshots';
import { usersHandlers } from './users';

// Общие MSW-хэндлеры — используются и в браузере (dev), и в Node (тесты).
// Описывайте здесь форму реального API для точного покрытия тестами.

export const handlers = [
  ...dashboardHandlers,
  ...clientsHandlers,
  ...settingsHandlers,
  ...calculationDateHandlers,
  ...accountHandlers,
  ...usersHandlers,
  ...snapshotsHandlers,
  ...dataSourceHandlers,
  ...realtimeHandlers,
];
