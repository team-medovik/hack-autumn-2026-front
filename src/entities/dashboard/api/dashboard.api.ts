import { getAnalyticsSummary } from '@/shared/api';

import type { DashboardResponse } from '../model/types';

export const dashboardApi = {
  get: (): Promise<DashboardResponse> => getAnalyticsSummary(),
};
