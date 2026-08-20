import { normalizePc } from './note';

/** Standard tuning in MIDI notes, from the low string (E) up to the high one (e). */
export const GUITAR_TUNING: readonly number[] = [40, 45, 50, 55, 59, 64];

/** Frets drawn by a chord diagram — every shape stays inside that box. */
export const DIAGRAM_FRETS = 5;

/** Position on one string: a fret number (0 = open), or 'x' for a muted string. */
export type FretPosition = number | 'x';

/** One position per string, indexed like GUITAR_TUNING (low → high). */
export type GuitarVoicing = readonly FretPosition[];

/** Strings the search anchors the root on; below the D string the bass gets too thin. */
const BASS_STRINGS = [0, 1, 2];

interface Candidate {
  readonly voicing: FretPosition[];
  readonly score: number;
}

/** The box the shape lives in, plus the open strings a hand can always reach. */
function candidateFrets(boxStart: number, boxEnd: number): number[] {
  const frets = boxStart > 0 ? [0] : [];
  for (let fret = boxStart; fret <= boxEnd; fret++) {
    frets.push(fret);
  }
  return frets;
}

/**
 * One shape with the root in the bass, the higher strings filled with chord
 * tones — a new note first, otherwise a doubled one, otherwise muted.
 * `pcs` and `rootPc` are expected normalized. Null when the result covers
 * too few notes to read as a chord.
 */
function buildVoicing(
  pcs: readonly number[],
  rootPc: number,
  tuning: readonly number[],
  bassString: number,
  boxStart: number,
): Candidate | null {
  const rootFret = normalizePc(rootPc - tuning[bassString]);
  if (rootFret < boxStart || rootFret > boxStart + DIAGRAM_FRETS - 1) return null;
  const frets = candidateFrets(boxStart, boxStart + DIAGRAM_FRETS - 1);

  const voicing: FretPosition[] = Array(tuning.length).fill('x');
  voicing[bassString] = rootFret;
  const covered = new Set([rootPc]);

  for (let string = bassString + 1; string < tuning.length; string++) {
    let best: { fret: number; pc: number; fresh: boolean } | null = null;
    for (const fret of frets) {
      const pc = normalizePc(tuning[string] + fret);
      if (!pcs.includes(pc)) continue;
      const fresh = !covered.has(pc);
      // Frets come in ascending order, so the first hit is already the lowest one.
      if (!best || (fresh && !best.fresh)) {
        best = { fret, pc, fresh };
      }
    }
    if (!best) continue;
    voicing[string] = best.fret;
    covered.add(best.pc);
  }

  // Three distinct notes make a chord readable — fewer only for smaller chords.
  if (covered.size < Math.min(3, pcs.length)) return null;

  const fretted = voicing.filter((p): p is number => typeof p === 'number' && p > 0);
  const span = fretted.length ? Math.max(...fretted) - Math.min(...fretted) : 0;
  // Muting a string below the bass is free — you simply do not strum it.
  const mutes = voicing.filter((p, i) => i > bassString && p === 'x').length;

  return { voicing, score: covered.size * 10 - span - mutes * 2 - rootFret * 0.3 };
}

/**
 * Best playable shape for a chord: root in the bass, chord tones only,
 * everything within one five-fret box. Every box position holding the root
 * is tried, then scored — which is what turns a scattered set of correct
 * notes into the barre or open shape a hand actually makes. Null when no
 * bass string yields a shape worth drawing.
 */
export function findVoicing(
  pcs: readonly number[],
  rootPc: number,
  tuning: readonly number[] = GUITAR_TUNING,
): GuitarVoicing | null {
  if (pcs.length === 0) return null;

  // Extensions reach past the octave (9th = 14), so fold them back first.
  const notes = pcs.map(normalizePc);
  const root = normalizePc(rootPc);

  let best: Candidate | null = null;
  for (const bassString of BASS_STRINGS) {
    const rootFret = normalizePc(root - tuning[bassString]);
    const first = Math.max(0, rootFret - DIAGRAM_FRETS + 1);
    for (let boxStart = first; boxStart <= rootFret; boxStart++) {
      const candidate = buildVoicing(notes, root, tuning, bassString, boxStart);
      // Ties keep the earlier candidate — the lower box, the easier reach.
      if (candidate && (!best || candidate.score > best.score)) {
        best = candidate;
      }
    }
  }
  return best?.voicing ?? null;
}

/** Lowest fret the diagram starts on; 1 when the shape uses the nut. */
export function voicingStartFret(voicing: GuitarVoicing): number {
  const fretted = voicing.filter((p): p is number => typeof p === 'number' && p > 0);
  return fretted.length ? Math.min(...fretted) : 1;
}
