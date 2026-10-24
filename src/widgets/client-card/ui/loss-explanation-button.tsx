import type { ClientCard } from '@/entities/client';
import { formatMoney } from '@/shared/lib/format';
import { Dialog } from '@/shared/ui/dialog';
import { TextButton } from '@/shared/ui/text-button';

import { LossExplanation } from './loss-explanation';

interface LossExplanationButtonProps {
  card: Pick<ClientCard, 'balance' | 'lossBreakdown'>;
}

/** Ссылка «Как посчитано» под причинами риска и окно с расчётом потери. */
export const LossExplanationButton = ({
  card: { balance, lossBreakdown },
}: LossExplanationButtonProps) => (
  <Dialog
    variant="info"
    size="l"
    title={`Как посчитана потеря ${formatMoney(balance.monthlyLoss)} в месяц`}
    description="Потеря клиента — сумма потерь по всем его услугам"
    trigger={<TextButton className="client-card__explain">Как посчитано</TextButton>}
  >
    <LossExplanation breakdown={lossBreakdown} balance={balance} />
  </Dialog>
);
