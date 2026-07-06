import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { AudioEngine } from '../../core/audio/audio-engine';
import { CADENCES, CadenceDef, ROMAN_DEGREES } from '../../core/music';
import { MusicState } from '../../core/state/music-state';

const STEP_MS = 850;

@Component({
  selector: 'dia-cadences-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (!state.isHeptatonic()) {
      <p class="hint">
        Les cadences classiques s'appliquent aux gammes de 7 notes — choisis une gamme heptatonique.
      </p>
    } @else {
      <div class="flex flex-col gap-3">
        @for (cadence of cadences; track cadence.id) {
          <button
            type="button"
            class="ccard"
            [class.playing]="playingId() === cadence.id"
            (click)="play(cadence)"
          >
            <div class="cn">{{ cadence.label }}</div>
            <div class="cd">{{ cadence.description }}</div>
            <div class="flex flex-wrap items-center gap-1">
              @for (degree of cadence.degrees; track $index) {
                <span
                  class="cstep"
                  [class.on]="playingId() === cadence.id && activeStep() === $index"
                >
                  <small>{{ roman(degree) }}</small>
                  {{ state.chordName(state.cadenceChord(degree)) }}
                </span>
              }
            </div>
          </button>
        }
      </div>
      <p class="hint">Touche une cadence pour l'écouter — chaque accord s'illumine en passant.</p>
    }
  `,
})
export class CadencesPage {
  protected readonly state = inject(MusicState);
  private readonly audio = inject(AudioEngine);
  protected readonly cadences = CADENCES;

  protected readonly playingId = signal<string | null>(null);
  protected readonly activeStep = signal(-1);
  private timers: ReturnType<typeof setTimeout>[] = [];

  constructor() {
    inject(DestroyRef).onDestroy(() => this.clearTimers());
  }

  protected roman(degree: number): string {
    return ROMAN_DEGREES[degree];
  }

  protected play(cadence: CadenceDef): void {
    this.clearTimers();
    this.playingId.set(cadence.id);
    this.activeStep.set(-1);
    this.audio.playProgression(this.state.cadenceMidis(cadence), STEP_MS / 1000);

    cadence.degrees.forEach((_, i) => {
      this.timers.push(setTimeout(() => this.activeStep.set(i), 50 + i * STEP_MS));
    });
    this.timers.push(
      setTimeout(() => {
        this.playingId.set(null);
        this.activeStep.set(-1);
      }, 50 + cadence.degrees.length * STEP_MS + 400),
    );
  }

  private clearTimers(): void {
    this.timers.forEach(clearTimeout);
    this.timers = [];
  }
}
