import type { SnapshotRecord, SnapshotVolume } from '@/entities/snapshot';

// Данные повторяют макеты Figma «Импорт/экспорт снимка (…)». Новые сверху.

export const INITIAL_SNAPSHOTS: readonly SnapshotRecord[] = [
  {
    id: 'snapshot-2026-10-23-2210',
    fileName: 'data.json',
    uploadedAt: new Date(2026, 9, 23, 22, 10).toISOString(),
    uploadedBy: 'analyst',
    clients: 42,
    services: 118,
  },
  {
    id: 'snapshot-2026-10-23-1800',
    fileName: 'data.json',
    uploadedAt: new Date(2026, 9, 23, 18, 0).toISOString(),
    uploadedBy: 'analyst',
    clients: 40,
    services: 112,
  },
  {
    id: 'snapshot-2026-10-22-2205',
    fileName: 'data-old.json',
    uploadedAt: new Date(2026, 9, 22, 22, 5).toISOString(),
    uploadedBy: 'analyst2',
    clients: 40,
    services: 109,
  },
];

const MOCK_CREATED_AT = '2026-10-01T12:00:00.000Z';
const MOCK_EXPIRES_AT = '2026-11-01T12:00:00.000Z';

/**
 * Содержимое файла снимка с нужным числом клиентов и услуг — для «Скачать JSON».
 * Формат тестовых данных кейса: `{ accounts, services, transactions }`, суммы в евроцентах.
 * На каждую услугу — оплаченный заказ.
 */
export const buildSnapshotFile = ({ clients, services }: SnapshotVolume) => ({
  accounts: Array.from({ length: clients }, (_, index) => ({
    id: index + 1,
    email: `user-${String(index + 1).padStart(4, '0')}@example.test`,
    balance: 10_000,
    withdrawBalance: 0,
    totalReplenished: 50_000,
    bonusBalance: 0,
    bonusState: 'locked',
  })),
  // Услуги раскладываем по клиентам по кругу
  services: Array.from({ length: services }, (_, index) => ({
    id: index + 1,
    name: `service-${String(index + 1).padStart(4, '0')}`,
    ownerId: (index % clients) + 1,
    paymentTerm: 'month',
    autoProlong: true,
    createdAt: MOCK_CREATED_AT,
    expiresAt: MOCK_EXPIRES_AT,
    status: 'active',
    price: 500,
  })),
  transactions: Array.from({ length: services }, (_, index) => ({
    id: index + 1,
    amount: 500,
    status: 'performed',
    performedAt: MOCK_CREATED_AT,
    createdAt: MOCK_CREATED_AT,
    type: 'order',
    serviceId: index + 1,
  })),
});
