import { detectScales } from './detect';

describe('detectScales', () => {
  it('finds C major and its relatives from its 7 notes', () => {
    const matches = detectScales(new Set([0, 2, 4, 5, 7, 9, 11]));
    const exact = matches.filter((m) => m.exact);
    expect(exact.some((m) => m.rootPc === 0 && m.scale.id === 'major')).toBe(true);
    expect(exact.some((m) => m.rootPc === 9 && m.scale.id === 'minor')).toBe(true);
    expect(matches[0].extraCount).toBe(0);
  });

  it('suggests broader scales for a partial input', () => {
    const matches = detectScales(new Set([0, 4, 7])); // C E G
    expect(matches.length).toBeGreaterThan(0);
    expect(matches.every((m) => [0, 4, 7].every((pc) => m.scalePcs.includes(pc)))).toBe(true);
  });

  it('returns nothing for an empty input or an impossible cluster', () => {
    expect(detectScales(new Set())).toEqual([]);
    expect(detectScales(new Set([0, 1, 2, 3, 4, 5, 6, 7, 8]))).toEqual([]);
  });
});
