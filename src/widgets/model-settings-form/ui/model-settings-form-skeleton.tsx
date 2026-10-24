import { AsideLayout } from '@/shared/ui/aside-layout';
import { Skeleton, SkeletonText } from '@/shared/ui/skeleton';

import './model-settings-form.scss';

/** Настройки грузятся: блоки параметров и кнопка сохранения — плашками. */
export const ModelSettingsFormSkeleton = () => (
  <AsideLayout
    aria-busy
    aside={
      <div className="model-settings-form-skeleton">
        <Skeleton height={56} />
      </div>
    }
  >
    {[6, 3, 3, 2].map((lines, index) => (
      <div key={index} className="model-settings-form-skeleton">
        <Skeleton width={160} height={24} />
        <SkeletonText lines={lines} />
      </div>
    ))}
  </AsideLayout>
);
