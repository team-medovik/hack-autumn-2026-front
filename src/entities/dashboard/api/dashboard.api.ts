import { api } from '@/shared/api';

import type { DashboardResponse } from '../model/types';

export const dashboardApi = {
  get: (): Promise<DashboardResponse> =>
    api.get<DashboardResponse>('/api/v1/dashboard').then((response) => response.data),
};
