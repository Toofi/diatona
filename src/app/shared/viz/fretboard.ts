import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Notation, normalizePc, pcName } from '../../core/music';
import { Highlight, NoteRole, noteRole } from './highlight';

interface FretCell {
  readonly fret: number;
  readonly role: NoteRole;
  readonly label: string;
}

interface FretString {
  readonly openMidi: number;
  readonly openLabel: string;
  readonly cells: readonly FretCell[];
}

/** Standard tuning, from the high string (e) down to the low one (E). */
const TUNING_MIDIS = [64, 59, 55, 50, 45, 40] as const;
const FRETS = 12;
const MARKED_FRETS = new Set([3, 5, 7, 9, 12]);

@Component({
  selector: 'dia-fretboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fwrap">
      <div class="fret">
        @for (string of strings(); track string.openMidi) {
          <div class="frow">
            <div class="fopen">{{ string.openLabel }}</div>
            @for (cell of string.cells; track cell.fret) {
              <div class="fcell" [class.nut]="cell.fret === 0">
                @if (cell.role) {
                  <div [class]="'fdot ' + cell.role">{{ cell.label }}</div>
                }
              </div>
            }
          </div>
        }
        <div class="fnums">
          <span class="fo"></span>
          @for (fret of fretNumbers; track fret) {
            <span [class.mark]="isMarked(fret)">{{ fret }}</span>
          }
        </div>
      </div>
    </div>
  `,
})
export class Fretboard {
  readonly highlight = input.required<Highlight>();
  readonly notation = input.required<Notation>();

  protected readonly fretNumbers = Array.from({ length: FRETS + 1 }, (_, i) => i);

  protected readonly strings = computed<readonly FretString[]>(() => {
    const hl = this.highlight();
    const notation = this.notation();
    return TUNING_MIDIS.map((openMidi) => ({
      openMidi,
      openLabel: pcName(openMidi, notation),
      cells: this.fretNumbers.map((fret) => {
        const pc = normalizePc(openMidi + fret);
        return {
          fret,
          role: noteRole(pc, hl),
          label: pcName(pc, notation).replace('#', '♯'),
        };
      }),
    }));
  });

  protected isMarked(fret: number): boolean {
    return MARKED_FRETS.has(fret);
  }
}
