/** Single contract between the state and the three visualizations. */
export interface Highlight {
  readonly mode: 'scale' | 'chord';
  readonly scaleRootPc: number;
  /** Highlighted root: the scale's or the chord's, depending on mode. */
  readonly rootPc: number;
  readonly scalePcs: ReadonlySet<number>;
  readonly chordPcs: ReadonlySet<number> | null;
  readonly scaleMidis: readonly number[];
  readonly chordMidis: readonly number[] | null;
}

export type NoteRole = 'root' | 'chord' | 'scale' | null;

export function noteRole(pc: number, highlight: Highlight): NoteRole {
  if (highlight.mode === 'chord') {
    if (!highlight.chordPcs?.has(pc)) return null;
    return pc === highlight.rootPc ? 'root' : 'chord';
  }
  if (!highlight.scalePcs.has(pc)) return null;
  return pc === highlight.rootPc ? 'root' : 'scale';
}
