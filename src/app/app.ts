import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, isActive } from '@angular/router';
import { AudioEngine } from './core/audio/audio-engine';
import { NOTE_NAMES, SCALES, ScaleId } from './core/music';
import { MusicState } from './core/state/music-state';
import { WashiButton } from './shared/ui/washi-button';
import { ChordDiagram } from './shared/viz/chord-diagram';
import { Fretboard } from './shared/viz/fretboard';
import { Piano } from './shared/viz/piano';
import { PianoRoll } from './shared/viz/piano-roll';

/** Which visualization the tab bar is showing. */
type VizId = 'piano' | 'roll' | 'guitar';

const VIZ_TABS: readonly { readonly id: VizId; readonly label: string }[] = [
  { id: 'piano', label: 'Piano' },
  { id: 'roll', label: 'Piano roll' },
  { id: 'guitar', label: 'Manche' },
];

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    WashiButton,
    Piano,
    PianoRoll,
    Fretboard,
    ChordDiagram,
  ],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly state = inject(MusicState);
  private readonly audio = inject(AudioEngine);
  private readonly router = inject(Router);

  protected readonly scales = SCALES;
  protected readonly vizTabs = VIZ_TABS;
  protected readonly viz = signal<VizId>('piano');
  protected readonly noteOptions = computed(() => NOTE_NAMES[this.state.notation()]);

  // Cadences and Deviner are lists to choose from — nothing to visualize under them.
  private readonly onScale = isActive('/gamme', this.router);
  private readonly onChords = isActive('/accords', this.router);
  protected readonly showViz = computed(() => this.onScale() || this.onChords());

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

  protected selectViz(id: VizId): void {
    this.viz.set(id);
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
