import type { DashboardResponse } from '@/entities/dashboard';
import { Reveal } from '@/shared/ui/reveal';
import { ChurnForecast } from '@/widgets/churn-forecast';
import { LossOverview } from '@/widgets/loss-overview';
import { LossReasons } from '@/widgets/loss-reasons';
import { RiskQueue } from '@/widgets/risk-queue';
import { TopRisk } from '@/widgets/top-risk';

interface DashboardGridProps {
  /** `undefined` — первая загрузка: каждый виджет показывает свой скелетон. */
  data?: DashboardResponse;
}

/** Сетка главной по макету «Дом»: сводка, затем две пары карточек. */
export const DashboardGrid = ({ data }: DashboardGridProps) => (
  <div className="home-page">
    <h1 className="visually-hidden">Сводка по рискам оттока</h1>

    <LossOverview data={data} />

    {/* Карточки ниже сводки оживают, когда до них докрутили, а не сразу при загрузке */}
    <div className="home-page__row home-page__row--focus">
      <Reveal className="home-page__card">
        <TopRisk data={data?.topRisk} />
      </Reveal>
      <Reveal className="home-page__card">
        <RiskQueue data={data?.riskQueue} selectedId={data?.topRisk?.id} />
      </Reveal>
    </div>

    <div className="home-page__row home-page__row--trends">
      <Reveal className="home-page__card">
        <LossReasons data={data?.lossReasons} />
      </Reveal>
      <Reveal className="home-page__card">
        <ChurnForecast data={data?.churn} />
      </Reveal>
    </div>
  </div>
);
