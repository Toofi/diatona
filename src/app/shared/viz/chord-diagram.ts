import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  Chord,
  DIAGRAM_FRETS,
  GUITAR_TUNING,
  Notation,
  findVoicing,
  normalizePc,
  pcName,
  voicingStartFret,
} from '../../core/music';

interface DiagramDot {
  readonly label: string;
  readonly isRoot: boolean;
}

interface DiagramCell {
  readonly fret: number;
  readonly dot: DiagramDot | null;
}

interface DiagramString {
  readonly name: string;
  /** '○' open, '×' muted, empty when the string is fretted inside the box. */
  readonly marker: string;
  readonly cells: readonly DiagramCell[];
}

interface DiagramView {
  readonly strings: readonly DiagramString[];
  readonly frets: readonly number[];
  /** The box starts on the nut, so the left edge is drawn thick. */
  readonly atNut: boolean;
  /** Positions low → high, the way a chord chart is written. */
  readonly tab: string;
}

/**
 * One playable shape for the selected chord, drawn on a neck lying down:
 * strings run left to right, frets stack from the nut on the left.
 */
@Component({
  selector: 'dia-chord-diagram',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (view(); as v) {
      <div class="cdiag">
        <div class="cdneck">
          @for (string of v.strings; track $index) {
            <div class="cdrow">
              <span class="cdopen">{{ string.name }}</span>
              <span class="cdmark">{{ string.marker }}</span>
              <div class="cdfrets" [class.nut]="v.atNut">
                @for (cell of string.cells; track cell.fret) {
                  <div class="cdcell">
                    @if (cell.dot; as dot) {
                      <div [class]="dot.isRoot ? 'fdot root' : 'fdot chord'">{{ dot.label }}</div>
                    }
                  </div>
                }
              </div>
            </div>
          }
        </div>
        <div class="cdrow cdnums">
          <span class="cdopen"></span>
          <span class="cdmark"></span>
          <div class="cdfrets">
            @for (fret of v.frets; track fret) {
              <div class="cdcell">{{ fret }}</div>
            }
          </div>
        </div>
        <p class="cdtab"><span>grave → aigu</span>{{ v.tab }}</p>
      </div>
    } @else {
      <p class="hint">Pas de position jouable pour cet accord sur six cordes.</p>
    }
  `,
})
export class ChordDiagram {
  readonly chord = input.required<Chord>();
  readonly notation = input.required<Notation>();

  protected readonly view = computed<DiagramView | null>(() => {
    const chord = this.chord();
    const notation = this.notation();
    const voicing = findVoicing(chord.pcs, chord.rootPc);
    if (!voicing) return null;

    const startFret = voicingStartFret(voicing);
    const frets = Array.from({ length: DIAGRAM_FRETS }, (_, i) => startFret + i);
    const lowestName = pcName(GUITAR_TUNING[0], notation);

    const strings: DiagramString[] = [];
    // Drawn high string first, so the diagram reads like a tab.
    for (let string = GUITAR_TUNING.length - 1; string >= 0; string--) {
      const position = voicing[string];
      const name = pcName(GUITAR_TUNING[string], notation);
      strings.push({
        // The high string sharing the low one's name is written lowercase (E/e).
        name: string > 0 && name === lowestName ? name.toLowerCase() : name,
        marker: position === 'x' ? '×' : position === 0 ? '○' : '',
        cells: frets.map((fret) => ({
          fret,
          dot: position === fret ? this.dotAt(string, fret, chord.rootPc, notation) : null,
        })),
      });
    }

    return {
      strings,
      frets,
      atNut: startFret === 1,
      tab: voicing.map((p) => (p === 'x' ? '×' : String(p))).join(' '),
    };
  });

  private dotAt(string: number, fret: number, rootPc: number, notation: Notation): DiagramDot {
    const pc = normalizePc(GUITAR_TUNING[string] + fret);
    return { label: pcName(pc, notation).replace('#', '♯'), isRoot: pc === rootPc };
  }
}
