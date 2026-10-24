import { describe, expect, it } from 'vitest';

import { factorHint } from './factor-hint';

describe('factorHint', () => {
  it('без изменений — только поведение и значение по умолчанию', () => {
    expect(
      factorHint({ behavior: 'всегда в полную силу', value: 70, saved: 70, byDefault: 70 }),
    ).toBe('всегда в полную силу / по умолчанию 70');
  });

  it('изменённый вес напоминает, сколько было', () => {
    expect(
      factorHint({ behavior: 'всегда в полную силу', value: 80, saved: 70, byDefault: 70 }),
    ).toBe('всегда в полную силу / было 70 / по умолчанию 70');
  });
});
