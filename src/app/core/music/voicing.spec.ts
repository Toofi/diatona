import { buildChord } from './chord';
import { scaleById } from './scale';
import { GUITAR_TUNING, findVoicing, voicingStartFret } from './voicing';
import { normalizePc } from './note';

/** Shape read low → high, the way a chord chart is written. */
function shape(pcs: readonly number[], rootPc: number): string {
  const voicing = findVoicing(pcs, rootPc);
  return voicing ? voicing.map((p) => (p === 'x' ? 'x' : String(p))).join('') : 'none';
}

describe('findVoicing', () => {
  it('finds the textbook open shapes', () => {
    expect(shape([4, 8, 11], 4)).toBe('022100'); // E
    expect(shape([9, 0, 4], 9)).toBe('x02210'); // Am
    expect(shape([7, 11, 2], 7)).toBe('320003'); // G
    expect(shape([0, 4, 7], 0)).toBe('x32010'); // C
  });

  it('falls back to a barre when no open shape exists', () => {
    expect(shape([1, 5, 8], 1)).toBe('x46664'); // C#, A-shape barre on the 4th fret
  });

  it('keeps shapes within reach of one hand', () => {
    for (let rootPc = 0; rootPc < 12; rootPc++) {
      const voicing = findVoicing([rootPc, rootPc + 4, rootPc + 7], rootPc)!;
      const fretted = voicing.filter((p): p is number => typeof p === 'number' && p > 0);
      expect(Math.max(...fretted) - Math.min(...fretted)).toBeLessThanOrEqual(3);
    }
  });

  it('puts the root in the bass', () => {
    const major = scaleById('major').intervals;
    for (let degree = 0; degree < major.length; degree++) {
      const chord = buildChord(0, major, degree, 'seventh');
      const voicing = findVoicing(chord.pcs, chord.rootPc);
      expect(voicing).not.toBeNull();
      const bass = voicing!.findIndex((p) => p !== 'x');
      expect(normalizePc(GUITAR_TUNING[bass] + (voicing![bass] as number))).toBe(chord.rootPc);
    }
  });

  it('only ever frets chord tones', () => {
    const pcs = [0, 4, 7, 10, 14]; // C9 — the 9th reaches past the octave
    const voicing = findVoicing(pcs, 0)!;
    voicing.forEach((position, string) => {
      if (position === 'x') return;
      expect(pcs.map(normalizePc)).toContain(normalizePc(GUITAR_TUNING[string] + position));
    });
  });

  it('keeps every shape inside a five-fret box', () => {
    for (let rootPc = 0; rootPc < 12; rootPc++) {
      const voicing = findVoicing([rootPc, rootPc + 4, rootPc + 7], rootPc);
      expect(voicing).not.toBeNull();
      const start = voicingStartFret(voicing!);
      for (const position of voicing!) {
        if (position === 'x' || position === 0) continue;
        expect(position).toBeGreaterThanOrEqual(start);
        expect(position).toBeLessThanOrEqual(start + 4);
      }
    }
  });

  it('draws nothing rather than a bogus one-note shape', () => {
    expect(findVoicing([], 0)).toBeNull();
  });
});
