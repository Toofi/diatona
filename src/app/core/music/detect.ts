import { SCALES, ScaleDef, scalePitchClasses } from './scale';

export interface ScaleMatch {
  readonly rootPc: number;
  readonly scale: ScaleDef;
  readonly scalePcs: readonly number[];
  /** Scale notes missing from the input. */
  readonly extraCount: number;
  /** The scale contains exactly the input notes. */
  readonly exact: boolean;
}

/**
 * Every scale (root × type) containing all of the input notes,
 * from the most specific matches to the broadest ones.
 * Relative scales (same notes, different root) are intentionally
 * all returned: only musical context can tell them apart.
 */
export function detectScales(input: ReadonlySet<number>): ScaleMatch[] {
  if (input.size === 0) return [];

  const matches: ScaleMatch[] = [];
  for (let root = 0; root < 12; root++) {
    for (const scale of SCALES) {
      const scalePcs = scalePitchClasses(root, scale.intervals);
      const set = new Set(scalePcs);
      let contained = true;
      for (const pc of input) {
        if (!set.has(pc)) {
          contained = false;
          break;
        }
      }
      if (!contained) continue;
      matches.push({
        rootPc: root,
        scale,
        scalePcs,
        extraCount: scalePcs.length - input.size,
        exact: scalePcs.length === input.size,
      });
    }
  }

  const scaleRank = new Map(SCALES.map((s, i) => [s.id, i]));
  return matches.sort(
    (a, b) =>
      a.extraCount - b.extraCount ||
      scaleRank.get(a.scale.id)! - scaleRank.get(b.scale.id)! ||
      a.rootPc - b.rootPc,
  );
}
