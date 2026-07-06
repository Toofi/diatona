import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AudioEngine } from '../../core/audio/audio-engine';
import { BASE_OCTAVE_MIDI, ScaleMatch, detectScales, pcName } from '../../core/music';
import { MusicState } from '../../core/state/music-state';
import { NoteNamePipe } from '../../shared/ui/note-name-pipe';
import { WashiButton } from '../../shared/ui/washi-button';

const ALL_PCS = Array.from({ length: 12 }, (_, i) => i);
const MAX_RESULTS = 12;

@Component({
  selector: 'dia-detect-page',
  imports: [NoteNamePipe, WashiButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p class="hint mb-3 mt-0">
      Coche les notes que tu entends ou que tu joues — je te propose les gammes qui les contiennent.
    </p>

    <div class="flex flex-wrap gap-2 mb-2" role="group" aria-label="Notes saisies">
      @for (pc of allPcs; track pc) {
        <button
          type="button"
          [diaWashi]="isSelected(pc) ? 'kiku' : 'plain'"
          class="vbtn"
          [class.active]="isSelected(pc)"
          [attr.aria-pressed]="isSelected(pc)"
          (click)="toggle(pc)"
        >
          {{ pc | noteName: state.notation() }}
        </button>
      }
    </div>

    @if (selected().size > 0) {
      <button type="button" class="hint bg-transparent border-none p-0 underline mb-4" (click)="clear()">
        tout effacer
      </button>
    }

    @if (selected().size === 0) {
      <p class="hint">– en attente de tes notes…</p>
    } @else if (matches().length === 0) {
      <p class="hint">
        Aucune gamme du carnet ne contient ces {{ selected().size }} notes — retire-en une et réessaie.
      </p>
    } @else {
      <div class="grid grid-cols-[repeat(auto-fill,minmax(215px,1fr))] gap-3 mt-4">
        @for (match of matches(); track trackMatch(match)) {
          <button type="button" class="dcard" (click)="apply(match)">
            <div class="rn">
              {{ match.exact ? 'correspondance exacte' : '+' + match.extraCount + ' note' + (match.extraCount > 1 ? 's' : '') }}
            </div>
            <div class="nm">
              {{ match.rootPc | noteName: state.notation() }} {{ match.scale.label.toLowerCase() }}
            </div>
            <div class="notes">
              @for (pc of match.scalePcs; track $index) {
                <span [class.guessed]="isSelected(pc)">{{ pc | noteName: state.notation() }}</span>
                @if (!$last) {
                  <span> · </span>
                }
              }
            </div>
            @if (match.exact) {
              <span class="fbadge fbadge-T">✓</span>
            }
          </button>
        }
      </div>
      @if (totalMatches() > matches().length) {
        <p class="hint">
          {{ totalMatches() - matches().length }} autres correspondances plus larges non affichées.
        </p>
      }
      <p class="hint">Touche une proposition pour l'ouvrir dans l'onglet Gamme.</p>
    }
  `,
})
export class DetectPage {
  protected readonly state = inject(MusicState);
  private readonly audio = inject(AudioEngine);
  private readonly router = inject(Router);

  protected readonly allPcs = ALL_PCS;
  protected readonly selected = signal<ReadonlySet<number>>(new Set());

  private readonly allMatches = computed(() => detectScales(this.selected()));
  protected readonly matches = computed(() => this.allMatches().slice(0, MAX_RESULTS));
  protected readonly totalMatches = computed(() => this.allMatches().length);

  protected isSelected(pc: number): boolean {
    return this.selected().has(pc);
  }

  protected toggle(pc: number): void {
    const next = new Set(this.selected());
    if (next.has(pc)) {
      next.delete(pc);
    } else {
      next.add(pc);
      this.audio.playNote(BASE_OCTAVE_MIDI + 12 + pc, undefined, 0.4, 0.14);
    }
    this.selected.set(next);
  }

  protected clear(): void {
    this.selected.set(new Set());
  }

  protected trackMatch(match: ScaleMatch): string {
    return `${match.rootPc}-${match.scale.id}`;
  }

  protected apply(match: ScaleMatch): void {
    this.state.selectRoot(match.rootPc);
    this.state.selectScale(match.scale.id);
    void this.router.navigate(['/gamme']);
  }

  protected pcLabel(pc: number): string {
    return pcName(pc, this.state.notation());
  }
}
