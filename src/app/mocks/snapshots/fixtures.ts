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

/**
 * Содержимое файла снимка с нужным числом клиентов и услуг — для «Скачать JSON».
 * Каркас `{ clients: [{ services: [] }] }`, как проверяет фронт; поля — для правдоподобия.
 */
export const buildSnapshotFile = ({ clients, services }: SnapshotVolume) => ({
  clients: Array.from({ length: clients }, (_, index) => ({
    id: String(10_000 + index),
    email: `client${index + 1}@example.com`,
    // Услуги раскладываем поровну, остаток — первым клиентам
    services: Array.from(
      { length: Math.floor(services / clients) + (index < services % clients ? 1 : 0) },
      (_, serviceIndex) => ({ id: `${10_000 + index}-${serviceIndex + 1}`, status: 'active' }),
    ),
  })),
});
