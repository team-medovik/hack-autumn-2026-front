import { useId } from 'react';

import { formatServiceNote, groupServices, type ClientService } from '@/entities/client';
import { SERVICE_FORMS } from '@/shared/config';
import { formatCount, formatMoney, formatNumber } from '@/shared/lib/format';
import { Accordion, AccordionItem } from '@/shared/ui/accordion';
import { ServiceRow } from '@/shared/ui/service-row';
import { Text } from '@/shared/ui/text';

interface ClientServicesProps {
  services: ClientService[];
}

/**
 * Услуги клиента по статусам. Раскрыты группы, где есть что продлевать;
 * удалённые и заблокированные свёрнуты.
 */
export const ClientServices = ({ services }: ClientServicesProps) => {
  const titleId = useId();
  const groups = groupServices(services);
  const liveGroups = groups.filter((group) => group.monthlyTotal !== null);

  return (
    <section aria-labelledby={titleId} className="client-card__services">
      <Text id={titleId} variant="label" as="h3" color="main">
        Услуги · {formatNumber(services.length)}
      </Text>

      {groups.length === 0 ? (
        <Text variant="caption" color="secondary">
          У клиента нет услуг
        </Text>
      ) : (
        <Accordion defaultValue={liveGroups.map((group) => group.status)}>
          {groups.map((group) => (
            <AccordionItem
              key={group.status}
              value={group.status}
              title={group.title}
              meta={formatCount(group.services.length, SERVICE_FORMS)}
              aside={
                group.monthlyTotal === null ? undefined : `${formatMoney(group.monthlyTotal)} / мес`
              }
              headingLevel={4}
            >
              <ul className="client-card__service-list">
                {group.services.map((service) => (
                  <li key={service.id}>
                    <ServiceRow
                      score={service.score}
                      level={service.level}
                      name={service.name}
                      note={formatServiceNote(service)}
                      price={
                        service.monthlyPrice === null
                          ? undefined
                          : formatMoney(service.monthlyPrice)
                      }
                    />
                  </li>
                ))}
              </ul>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </section>
  );
};
