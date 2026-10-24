import { CLIENT_FORMS, SERVICE_FORMS } from '@/shared/config';
import { formatCount } from '@/shared/lib/format';

import type { SnapshotVolume } from '../model/types';

/** «42 клиента, 118 услуг» */
export const formatSnapshotVolume = ({ clients, services }: SnapshotVolume) =>
  `${formatCount(clients, CLIENT_FORMS)}, ${formatCount(services, SERVICE_FORMS)}`;
