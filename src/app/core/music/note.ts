/**
 * Notes and conversions — pure domain code, no Angular dependency.
 * "Ableton" octave convention: the displayed octave is floor(midi/12) - 2.
 */
export type Notation = 'int' | 'fr';

export const NOTE_NAMES: Record<Notation, readonly string[]> = {
  int: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
  fr: ['Do', 'Do#', 'Ré', 'Ré#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si'],
};

/** Starting MIDI note of the visualizations (C3 in our display convention). */
export const BASE_OCTAVE_MIDI = 48;

export function normalizePc(value: number): number {
  return ((value % 12) + 12) % 12;
}

export function pcName(pc: number, notation: Notation): string {
  return NOTE_NAMES[notation][normalizePc(pc)];
}

export function midiOctave(midi: number): number {
  return Math.floor(midi / 12) - 2;
}

export function midiName(midi: number, notation: Notation): string {
  return pcName(midi, notation) + midiOctave(midi);
}

export function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}
