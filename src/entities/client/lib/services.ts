import { formatDayMonth, pluralize, type PluralForms } from '@/shared/lib/format';

import {
  SERVICE_STATUSES,
  type ClientService,
  type ServiceEventType,
  type ServiceStatus,
} from '../model/card-types';

/** Заголовок группы по числу услуг: «Удалена» — одна, «Удалены» — несколько. */
const STATUS_FORMS: Record<ServiceStatus, PluralForms> = {
  awaiting_payment: ['Ожидает оплаты', 'Ожидают оплаты', 'Ожидают оплаты'],
  active: ['Активна', 'Активны', 'Активны'],
  disabled_by_client: ['Выключена клиентом', 'Выключены клиентом', 'Выключены клиентом'],
  blocked: ['Заблокирована', 'Заблокированы', 'Заблокированы'],
  deleted: ['Удалена', 'Удалены', 'Удалены'],
};

const EVENT_LABELS: Record<ServiceEventType, string> = {
  renew: 'продлится',
  expire: 'истекает',
  delete: 'удалят',
};

export interface ServiceGroup {
  status: ServiceStatus;
  /** «Ожидает оплаты», «Удалены» — в числе по количеству услуг. */
  title: string;
  services: ClientService[];
  /** Сумма в месяц по услугам группы. `null` — ни одна не продлевается. */
  monthlyTotal: number | null;
}

const sumPrices = (services: readonly ClientService[]) =>
  services.reduce<number | null>(
    (sum, { monthlyPrice }) => (monthlyPrice === null ? sum : (sum ?? 0) + monthlyPrice),
    null,
  );

/** Услуги по статусам в порядке SERVICE_STATUSES. Пустых групп нет. */
export const groupServices = (services: readonly ClientService[]): ServiceGroup[] =>
  SERVICE_STATUSES.flatMap((status) => {
    const inGroup = services.filter((service) => service.status === status);
    if (inGroup.length === 0) {
      return [];
    }
    return [
      {
        status,
        title: pluralize(inGroup.length, STATUS_FORMS[status]),
        services: inGroup,
        monthlyTotal: sumPrices(inGroup),
      },
    ];
  });

/** Подпись услуги: «удалят 21.10, автопродление выкл.»; у удалённой события нет — пусто. */
export const formatServiceNote = ({
  event,
  autoRenew,
}: Pick<ClientService, 'event' | 'autoRenew'>) =>
  [
    event && `${EVENT_LABELS[event.type]} ${formatDayMonth(event.date)}`,
    autoRenew !== null && `автопродление ${autoRenew ? 'вкл.' : 'выкл.'}`,
  ]
    .filter(Boolean)
    .join(', ');
