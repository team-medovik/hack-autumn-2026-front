import { describe, expect, it } from 'vitest';

import { wasNote, withDefault } from './setting-texts';

describe('withDefault', () => {
  it('дописывает значение по умолчанию', () => {
    expect(withDefault('Риск считается средним.', 40)).toBe(
      'Риск считается средним. По умолчанию 40',
    );
    expect(withDefault('Снижает потерю.', 0.5)).toBe('Снижает потерю. По умолчанию 0,5');
  });
});

describe('wasNote', () => {
  it('появляется только у изменённого значения', () => {
    expect(wasNote(70, 70)).toBeUndefined();
    expect(wasNote(80, 70)).toBe('было 70');
    expect(wasNote(0.55, 0.5)).toBe('было 0,5');
  });
});
