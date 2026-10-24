import { SnapshotManager } from '@/widgets/snapshot-manager';

/** «Импорт/экспорт снимка»: выгрузка биллинга, по которой считаются риски и потери. */
export const SnapshotPage = () => (
  <>
    <h1 className="visually-hidden">Импорт и экспорт снимка</h1>
    <SnapshotManager />
  </>
);
