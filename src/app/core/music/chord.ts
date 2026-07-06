import { BASE_OCTAVE_MIDI, normalizePc } from './note';
import { stepOffset } from './scale';

export type ChordVariantId = 'triad' | 'seventh' | 'ninth' | 'sus2' | 'sus4' | 'add9' | 'sixth';

export interface ChordVariant {
  readonly id: ChordVariantId;
  readonly label: string;
  /** Scale degrees stacked from the chord root. */
  readonly steps: readonly number[];
}

export const CHORD_VARIANTS: readonly ChordVariant[] = [
  { id: 'triad', label: 'Triade', steps: [0, 2, 4] },
  { id: 'seventh', label: '7e', steps: [0, 2, 4, 6] },
  { id: 'ninth', label: '9e', steps: [0, 2, 4, 6, 8] },
  { id: 'sus2', label: 'sus2', steps: [0, 1, 4] },
  { id: 'sus4', label: 'sus4', steps: [0, 3, 4] },
  { id: 'add9', label: 'add9', steps: [0, 2, 4, 8] },
  { id: 'sixth', label: '6te', steps: [0, 2, 4, 5] },
];

export type HarmonicFunction = 'T' | 'SD' | 'D';

export const HEPTATONIC_FUNCTIONS: readonly HarmonicFunction[] = ['T', 'SD', 'T', 'SD', 'D', 'T', 'D'];

export const FUNCTION_LABELS: Record<HarmonicFunction, string> = {
  T: 'Tonique',
  SD: 'Sous-dominante',
  D: 'Dominante',
};

export const ROMAN_DEGREES = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'] as const;

/** Chord quality keyed by its interval fingerprint from the root. */
const QUALITY_BY_SHAPE: Readonly<Record<string, string>> = {
  '0,4,7': '', '0,3,7': 'm', '0,3,6': 'dim', '0,4,8': 'aug',
  '0,2,7': 'sus2', '0,1,7': 'sus♭2', '0,5,7': 'sus4', '0,6,7': 'sus♯4',
  '0,5,6': 'sus4♭5', '0,2,6': 'sus2♭5', '0,1,6': 'sus♭2♭5',
  '0,4,7,11': 'maj7', '0,4,7,10': '7', '0,3,7,10': 'm7', '0,3,6,10': 'm7♭5', '0,3,6,9': 'dim7',
  '0,3,7,11': 'm(maj7)', '0,4,8,11': 'maj7♯5', '0,4,8,10': '7♯5',
  '0,4,7,9': '6', '0,3,7,9': 'm6', '0,3,7,8': 'm♭6', '0,4,7,8': '♭6',
  '0,4,7,14': 'add9', '0,3,7,14': 'm(add9)', '0,4,7,13': 'add♭9', '0,3,7,13': 'm(add♭9)',
  '0,3,6,14': 'dim(add9)', '0,3,6,13': 'dim(add♭9)', '0,4,8,14': 'aug(add9)',
  '0,4,7,11,14': 'maj9', '0,4,7,10,14': '9', '0,3,7,10,14': 'm9',
  '0,3,7,10,13': 'm7♭9', '0,4,7,10,13': '7♭9', '0,3,6,10,13': 'm7♭5♭9', '0,3,6,10,14': 'm9♭5',
  '0,4,7,11,13': 'maj7♭9', '0,3,7,11,14': 'm9(maj7)', '0,4,8,11,14': 'maj9♯5', '0,3,6,9,14': 'dim9',
};

export interface Chord {
  readonly degree: number;
  readonly variantId: ChordVariantId;
  readonly rootPc: number;
  /** Semitone offsets from the scale root. */
  readonly offsets: readonly number[];
  /** Intervals from the chord root. */
  readonly intervals: readonly number[];
  readonly pcs: readonly number[];
  /** Quality suffix ("m7", "sus4"…); empty for a major chord. */
  readonly quality: string;
}

export function chordVariantById(id: ChordVariantId): ChordVariant {
  return CHORD_VARIANTS.find((v) => v.id === id) ?? CHORD_VARIANTS[0];
}

export function buildChord(
  scaleRoot: number,
  scaleIntervals: readonly number[],
  degree: number,
  variantId: ChordVariantId,
): Chord {
  const variant = chordVariantById(variantId);
  const offsets = variant.steps.map((s) => stepOffset(scaleIntervals, degree + s));
  const base = offsets[0];
  const intervals = offsets.map((o) => o - base);
  const quality = QUALITY_BY_SHAPE[intervals.join(',')] ?? `(${intervals.slice(1).join('·')})`;
  return {
    degree,
    variantId: variant.id,
    rootPc: normalizePc(scaleRoot + base),
    offsets,
    intervals,
    pcs: offsets.map((o) => normalizePc(scaleRoot + o)),
    quality,
  };
}

/** Chord voicing anchored on the display octave. */
export function chordMidis(chord: Chord, scaleRoot: number): number[] {
  return chord.offsets.map((o) => BASE_OCTAVE_MIDI + scaleRoot + o);
}
