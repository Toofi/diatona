import { buildChord } from './chord';
import { scaleById } from './scale';

describe('buildChord', () => {
  const major = scaleById('major').intervals;

  it('harmonizes C major into seventh chords', () => {
    const qualities = major.map((_, d) => buildChord(0, major, d, 'seventh').quality);
    expect(qualities).toEqual(['maj7', 'm7', 'm7', 'maj7', '7', 'm7', 'm7♭5']);
  });

  it('builds a diatonic V9', () => {
    const chord = buildChord(0, major, 4, 'ninth');
    expect(chord.quality).toBe('9');
    expect(chord.intervals).toEqual([0, 4, 7, 10, 14]);
  });

  it('replaces the third for a sus4', () => {
    expect(buildChord(0, major, 0, 'sus4').quality).toBe('sus4');
  });
});
