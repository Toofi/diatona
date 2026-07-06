import { normalizePc } from './note';

export type ScaleId =
  | 'major'
  | 'minor'
  | 'harmonic-minor'
  | 'melodic-minor'
  | 'dorian'
  | 'phrygian'
  | 'lydian'
  | 'mixolydian'
  | 'locrian'
  | 'pentatonic-major'
  | 'pentatonic-minor'
  | 'blues';

export interface ScaleDef {
  readonly id: ScaleId;
  readonly label: string;
  readonly intervals: readonly number[];
}

export const SCALES: readonly ScaleDef[] = [
  { id: 'major', label: 'Majeur (ionien)', intervals: [0, 2, 4, 5, 7, 9, 11] },
  { id: 'minor', label: 'Mineur naturel', intervals: [0, 2, 3, 5, 7, 8, 10] },
  { id: 'harmonic-minor', label: 'Mineur harmonique', intervals: [0, 2, 3, 5, 7, 8, 11] },
  { id: 'melodic-minor', label: 'Mineur mélodique', intervals: [0, 2, 3, 5, 7, 9, 11] },
  { id: 'dorian', label: 'Dorien', intervals: [0, 2, 3, 5, 7, 9, 10] },
  { id: 'phrygian', label: 'Phrygien', intervals: [0, 1, 3, 5, 7, 8, 10] },
  { id: 'lydian', label: 'Lydien', intervals: [0, 2, 4, 6, 7, 9, 11] },
  { id: 'mixolydian', label: 'Mixolydien', intervals: [0, 2, 4, 5, 7, 9, 10] },
  { id: 'locrian', label: 'Locrien', intervals: [0, 1, 3, 5, 6, 8, 10] },
  { id: 'pentatonic-major', label: 'Pentatonique majeure', intervals: [0, 2, 4, 7, 9] },
  { id: 'pentatonic-minor', label: 'Pentatonique mineure', intervals: [0, 3, 5, 7, 10] },
  { id: 'blues', label: 'Blues', intervals: [0, 3, 5, 6, 7, 10] },
];

export function scaleById(id: ScaleId): ScaleDef {
  return SCALES.find((s) => s.id === id) ?? SCALES[0];
}

/** Semitone offset of the i-th scale degree (may exceed the octave). */
export function stepOffset(intervals: readonly number[], index: number): number {
  const n = intervals.length;
  return intervals[index % n] + 12 * Math.floor(index / n);
}

export function scalePitchClasses(root: number, intervals: readonly number[]): number[] {
  return intervals.map((iv) => normalizePc(root + iv));
}
