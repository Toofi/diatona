import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { BASE_OCTAVE_MIDI, Notation, midiName, normalizePc } from '../../core/music';
import { Highlight } from './highlight';

interface RollBlock {
  readonly column: number;
  readonly span: number;
  readonly kind: 'scale' | 'chord' | 'root';
}

interface RollRow {
  readonly midi: number;
  readonly label: string;
  readonly inScale: boolean;
  readonly isRoot: boolean;
  readonly blocks: readonly RollBlock[];
}

@Component({
  selector: 'dia-piano-roll',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="proll">
      @for (row of rows(); track row.midi) {
        <div class="prow" [class.inscale]="row.inScale" [class.isroot]="row.isRoot">
          <div class="plbl">{{ row.label }}</div>
          <div class="pgrid" [style.grid-template-columns]="gridColumns()">
            @for (cell of cells(); track cell) {
              <div class="pcell" [style.grid-column]="cell + 1" [style.grid-row]="1"></div>
            }
            @for (block of row.blocks; track block.column) {
              <div
                [class]="'pnote ' + block.kind"
                [style.grid-column]="block.column + 1 + ' / span ' + block.span"
              ></div>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class PianoRoll {
  readonly highlight = input.required<Highlight>();
  readonly notation = input.required<Notation>();

  private readonly layout = computed(() => {
    const hl = this.highlight();
    const notation = this.notation();
    const bottom = BASE_OCTAVE_MIDI + hl.scaleRootPc;
    let top = bottom + 12;

    let columns: number;
    let blocks: readonly (RollBlock & { midi: number })[];

    if (hl.mode === 'chord' && hl.chordMidis) {
      top = Math.max(bottom + 12, ...hl.chordMidis);
      columns = 8;
      blocks = hl.chordMidis.map((midi) => ({
        midi,
        column: 0,
        span: columns,
        kind: normalizePc(midi) === hl.rootPc ? 'root' : 'chord',
      }));
    } else {
      columns = hl.scaleMidis.length;
      blocks = hl.scaleMidis.map((midi, i) => ({
        midi,
        column: i,
        span: 1,
        kind: normalizePc(midi) === hl.rootPc ? 'root' : 'scale',
      }));
    }

    const rows: RollRow[] = [];
    for (let midi = top; midi >= bottom; midi--) {
      const pc = normalizePc(midi);
      rows.push({
        midi,
        label: midiName(midi, notation),
        inScale: hl.scalePcs.has(pc),
        isRoot: pc === hl.scaleRootPc,
        blocks: blocks.filter((b) => b.midi === midi),
      });
    }
    return { rows, columns };
  });

  protected readonly rows = computed(() => this.layout().rows);
  protected readonly gridColumns = computed(() => `repeat(${this.layout().columns}, 1fr)`);
  protected readonly cells = computed(() =>
    Array.from({ length: this.layout().columns }, (_, i) => i),
  );
}
