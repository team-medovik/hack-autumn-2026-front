import { useEntityChanges } from './use-entity-changes';

/** Держит поток изменений, пока открыта панель (только с сессией). */
export const RealtimeUpdates = () => {
  useEntityChanges();
  return null;
};
