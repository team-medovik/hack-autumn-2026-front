import { Skeleton, SkeletonText } from '@/shared/ui/skeleton';

/** Настройки грузятся: блоки параметров и кнопка сохранения — плашками. */
export const ModelSettingsFormSkeleton = () => (
  <div className="model-settings-form" aria-busy>
    <div className="model-settings-form__params">
      {[6, 3, 3, 2].map((lines, index) => (
        <div key={index} className="model-settings-form__skeleton-section">
          <Skeleton width={160} height={24} />
          <SkeletonText lines={lines} />
        </div>
      ))}
    </div>
    <div className="model-settings-form__aside">
      <div className="model-settings-form__skeleton-section">
        <Skeleton height={56} />
      </div>
    </div>
  </div>
);
