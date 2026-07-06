import { Injectable, computed, signal } from '@angular/core';
import {
  BASE_OCTAVE_MIDI,
  CadenceDef,
  Chord,
  ChordVariantId,
  Notation,
  ScaleId,
  buildChord,
  chordMidis,
  normalizePc,
  pcName,
  scaleById,
  scalePitchClasses,
  stepOffset,
} from '../music';
import { Highlight } from '../../shared/viz/highlight';

/** Single source of truth for the harmonic exploration, signals-based. */
@Injectable({ providedIn: 'root' })
export class MusicState {
  readonly root = signal(0);
  readonly scaleId = signal<ScaleId>('major');
  readonly notation = signal<Notation>('int');
  readonly degree = signal(0);
  readonly variantId = signal<ChordVariantId>('triad');
  /** What the visualizations display: the scale, or the selected chord. */
  readonly view = signal<'scale' | 'chord'>('scale');

  readonly scale = computed(() => scaleById(this.scaleId()));
  readonly scalePcs = computed(() => scalePitchClasses(this.root(), this.scale().intervals));
  readonly isHeptatonic = computed(() => this.scale().intervals.length === 7);

  /** One chord per degree, using the current variant. */
  readonly degreeChords = computed<readonly Chord[]>(() => {
    const intervals = this.scale().intervals;
    return intervals.map((_, d) => buildChord(this.root(), intervals, d, this.variantId()));
  });

  readonly selectedChord = computed(() =>
    buildChord(this.root(), this.scale().intervals, this.degree(), this.variantId()),
  );

  /** Ascending scale notes over one octave, from the tonic up to the tonic of the next octave. */
  readonly scaleMidis = computed<readonly number[]>(() => {
    const root3 = BASE_OCTAVE_MIDI + this.root();
    const intervals = this.scale().intervals;
    const out: number[] = [];
    for (let i = 0; i <= intervals.length; i++) {
      out.push(root3 + stepOffset(intervals, i));
    }
    return out;
  });

  readonly highlight = computed<Highlight>(() => {
    const scalePcs = new Set(this.scalePcs());
    const scaleRootPc = this.root();
    if (this.view() === 'chord') {
      const chord = this.selectedChord();
      return {
        mode: 'chord',
        scaleRootPc,
        rootPc: chord.rootPc,
        scalePcs,
        chordPcs: new Set(chord.pcs),
        scaleMidis: this.scaleMidis(),
        chordMidis: chordMidis(chord, scaleRootPc),
      };
    }
    return {
      mode: 'scale',
      scaleRootPc,
      rootPc: scaleRootPc,
      scalePcs,
      chordPcs: null,
      scaleMidis: this.scaleMidis(),
      chordMidis: null,
    };
  });

  selectRoot(pc: number): void {
    this.root.set(normalizePc(pc));
  }

  selectScale(id: ScaleId): void {
    this.scaleId.set(id);
    this.degree.set(0);
  }

  selectDegree(degree: number): void {
    this.degree.set(degree);
  }

  selectVariant(id: ChordVariantId): void {
    this.variantId.set(id);
  }

  chordName(chord: Chord): string {
    return pcName(chord.rootPc, this.notation()) + chord.quality;
  }

  /** Triad chord of a degree, used by cadences. */
  cadenceChord(degree: number): Chord {
    return buildChord(this.root(), this.scale().intervals, degree, 'triad');
  }

  cadenceMidis(cadence: CadenceDef): number[][] {
    return cadence.degrees.map((d) => chordMidis(this.cadenceChord(d), this.root()));
  }
}
