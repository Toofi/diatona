import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AudioEngine } from './core/audio/audio-engine';
import { NOTE_NAMES, SCALES, ScaleId } from './core/music';
import { MusicState } from './core/state/music-state';
import { WashiButton } from './shared/ui/washi-button';
import { Fretboard } from './shared/viz/fretboard';
import { Piano } from './shared/viz/piano';
import { PianoRoll } from './shared/viz/piano-roll';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, WashiButton, Piano, PianoRoll, Fretboard],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly state = inject(MusicState);
  private readonly audio = inject(AudioEngine);

  protected readonly scales = SCALES;
  protected readonly noteOptions = computed(() => NOTE_NAMES[this.state.notation()]);

  protected readonly playLabel = computed(() =>
    this.state.view() === 'chord' ? "○ Écouter l'accord" : '○ Écouter la gamme',
  );

  protected readonly vizTitle = computed(() => {
    if (this.state.view() === 'chord') {
      return `Accord — ${this.state.chordName(this.state.selectedChord())}`;
    }
    const root = this.noteOptions()[this.state.root()];
    return `Notes de la gamme — ${root} ${this.state.scale().label.toLowerCase()}`;
  });

  protected onRootChange(event: Event): void {
    this.state.selectRoot(Number((event.target as HTMLSelectElement).value));
  }

  protected onScaleChange(event: Event): void {
    this.state.selectScale((event.target as HTMLSelectElement).value as ScaleId);
  }

  protected onNotationChange(event: Event): void {
    this.state.notation.set((event.target as HTMLSelectElement).value === 'fr' ? 'fr' : 'int');
  }

  protected play(): void {
    const highlight = this.state.highlight();
    if (highlight.mode === 'chord' && highlight.chordMidis) {
      this.audio.playChord(highlight.chordMidis);
    } else {
      this.audio.playSequence(highlight.scaleMidis);
    }
  }
}
