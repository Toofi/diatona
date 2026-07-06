import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { AudioEngine } from '../../core/audio/audio-engine';
import { BASE_OCTAVE_MIDI, Notation, midiName, normalizePc } from '../../core/music';
import { Highlight, NoteRole, noteRole } from './highlight';

interface PianoKey {
  readonly midi: number;
  readonly role: NoteRole;
  readonly label: string;
  readonly left?: string;
}

const WHITE_PCS = new Set([0, 2, 4, 5, 7, 9, 11]);
const OCTAVES = 2;

@Component({
  selector: 'dia-piano',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="piano">
      @for (key of whiteKeys(); track key.midi) {
        <button
          type="button"
          class="wkey"
          [class]="'wkey ' + (key.role ?? '')"
          [attr.aria-label]="key.label"
          (click)="play(key.midi)"
        >
          <span class="lbl">{{ key.label }}</span>
        </button>
      }
      @for (key of blackKeys(); track key.midi) {
        <button
          type="button"
          [class]="'bkey ' + (key.role ?? '')"
          [style.left]="key.left"
          [attr.aria-label]="key.label"
          (click)="play(key.midi)"
        ></button>
      }
    </div>
  `,
})
export class Piano {
  readonly highlight = input.required<Highlight>();
  readonly notation = input.required<Notation>();

  private readonly audio = inject(AudioEngine);

  private readonly keys = computed(() => {
    const hl = this.highlight();
    const notation = this.notation();
    const whites: PianoKey[] = [];
    const blacks: PianoKey[] = [];
    const whiteCount = 7 * OCTAVES;
    const whiteWidth = 100 / whiteCount;
    let whiteIndex = 0;

    for (let midi = BASE_OCTAVE_MIDI; midi < BASE_OCTAVE_MIDI + 12 * OCTAVES; midi++) {
      const pc = normalizePc(midi);
      const key: PianoKey = { midi, role: noteRole(pc, hl), label: midiName(midi, notation) };
      if (WHITE_PCS.has(pc)) {
        whites.push(key);
        whiteIndex++;
      } else {
        blacks.push({ ...key, left: `calc(${whiteIndex * whiteWidth}% - 2.6%)` });
      }
    }
    return { whites, blacks };
  });

  protected readonly whiteKeys = computed(() => this.keys().whites);
  protected readonly blackKeys = computed(() => this.keys().blacks);

  protected play(midi: number): void {
    this.audio.playNote(midi);
  }
}
