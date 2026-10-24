import { describe, expect, it } from 'vitest';

import { formatServiceNote, groupServices } from './services';
import type { ClientService } from '../model/card-types';

const service = (patch: Partial<ClientService>): ClientService => ({
  id: 'service-0001',
  name: 'service-0001',
  score: 50,
  level: 'medium',
  status: 'active',
  monthlyPrice: 5,
  event: null,
  autoRenew: true,
  ...patch,
});

describe('groupServices', () => {
  it('группирует в порядке статусов, считает сумму и склоняет заголовок', () => {
    const groups = groupServices([
      service({ id: '1', status: 'deleted', monthlyPrice: null }),
      service({ id: '2', status: 'awaiting_payment', monthlyPrice: 9.9 }),
      service({ id: '3', status: 'deleted', monthlyPrice: null }),
      service({ id: '4', status: 'awaiting_payment', monthlyPrice: 4.95 }),
    ]);

    expect(groups.map(({ status, title }) => [status, title])).toEqual([
      ['awaiting_payment', 'Ожидают оплаты'],
      ['deleted', 'Удалены'],
    ]);
    expect(groups[0].monthlyTotal).toBeCloseTo(14.85);
    expect(groups[1].monthlyTotal).toBeNull();
    expect(groups[1].services.map(({ id }) => id)).toEqual(['1', '3']);
  });

  it('без услуг — без групп', () => {
    expect(groupServices([])).toEqual([]);
  });
});

describe('formatServiceNote', () => {
  it('событие и автопродление', () => {
    expect(
      formatServiceNote({ event: { type: 'delete', date: '2026-10-21' }, autoRenew: false }),
    ).toBe('удалят 21.10, автопродление выкл.');
    expect(
      formatServiceNote({ event: { type: 'renew', date: '2026-11-12' }, autoRenew: true }),
    ).toBe('продлится 12.11, автопродление вкл.');
  });

  it('без события — только автопродление, у удалённой — ничего', () => {
    expect(formatServiceNote({ event: null, autoRenew: true })).toBe('автопродление вкл.');
    expect(formatServiceNote({ event: null, autoRenew: null })).toBe('');
  });
});
