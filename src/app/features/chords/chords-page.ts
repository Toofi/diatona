import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { AudioEngine } from '../../core/audio/audio-engine';
import {
  CHORD_VARIANTS,
  Chord,
  ChordVariantId,
  FUNCTION_LABELS,
  HEPTATONIC_FUNCTIONS,
  HarmonicFunction,
  ROMAN_DEGREES,
  chordMidis,
} from '../../core/music';
import { MusicState } from '../../core/state/music-state';
import { NoteNamePipe } from '../../shared/ui/note-name-pipe';
import { WashiButton } from '../../shared/ui/washi-button';

@Component({
  selector: 'dia-chords-page',
  imports: [NoteNamePipe, WashiButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-wrap gap-2 mb-4" role="radiogroup" aria-label="Variante d'accord">
      @for (variant of variants; track variant.id) {
        <button
          type="button"
          [diaWashi]="state.variantId() === variant.id ? 'kiku' : 'plain'"
          class="vbtn"
          [class.active]="state.variantId() === variant.id"
          role="radio"
          [attr.aria-checked]="state.variantId() === variant.id"
          (click)="selectVariant(variant.id)"
        >
          {{ variant.label }}
        </button>
      }
    </div>

    <div class="grid grid-cols-[repeat(auto-fill,minmax(155px,1fr))] gap-3 mb-4">
      @for (chord of state.degreeChords(); track chord.degree) {
        <button
          type="button"
          class="dcard"
          [class.selected]="chord.degree === state.degree()"
          (click)="selectChord(chord)"
        >
          <div class="rn">{{ degreeLabel(chord.degree) }}</div>
          <div class="nm">{{ state.chordName(chord) }}</div>
          <div class="notes">
            @for (pc of chord.pcs; track $index) {
              {{ $index === 0 ? '' : '· ' }}{{ pc | noteName: state.notation() }}
            }
          </div>
          @if (functionOf(chord.degree); as fn) {
            <span class="fbadge" [class]="'fbadge fbadge-' + fn" [title]="functionLabel(fn)">
              {{ fn }}
            </span>
          }
        </button>
      }
    </div>

    @if (state.isHeptatonic()) {
      <div class="flex flex-wrap gap-4 text-[.78rem] text-ink-soft mb-4">
        <span><b class="fbadge-legend fbadge-T">T</b> tonique</span>
        <span><b class="fbadge-legend fbadge-SD">SD</b> sous-dominante</span>
        <span><b class="fbadge-legend fbadge-D">D</b> dominante</span>
        <span><b class="fbadge-legend fbadge-D">●</b> fondamentale</span>
      </div>
    }
  `,
})
export class ChordsPage {
  protected readonly state = inject(MusicState);
  private readonly audio = inject(AudioEngine);
  protected readonly variants = CHORD_VARIANTS;

  constructor() {
    this.state.view.set('chord');
    inject(DestroyRef).onDestroy(() => this.state.view.set('scale'));
  }

  protected selectVariant(id: ChordVariantId): void {
    this.state.selectVariant(id);
    this.playSelected();
  }

  protected selectChord(chord: Chord): void {
    this.state.selectDegree(chord.degree);
    this.audio.playChord(chordMidis(chord, this.state.root()));
  }

  private playSelected(): void {
    this.audio.playChord(chordMidis(this.state.selectedChord(), this.state.root()));
  }

  protected degreeLabel(degree: number): string {
    return this.state.isHeptatonic() ? ROMAN_DEGREES[degree] : `Deg. ${degree + 1}`;
  }

  protected functionOf(degree: number): HarmonicFunction | null {
    return this.state.isHeptatonic() ? HEPTATONIC_FUNCTIONS[degree] : null;
  }

  protected functionLabel(fn: HarmonicFunction): string {
    return FUNCTION_LABELS[fn];
  }
}
