import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MusicState } from '../../core/state/music-state';
import { NoteNamePipe } from '../../shared/ui/note-name-pipe';
import { ROMAN_DEGREES } from '../../core/music';

@Component({
  selector: 'dia-scale-page',
  imports: [NoteNamePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ul class="flex flex-wrap gap-x-3 gap-y-2 mb-5 list-none p-0 m-0">
      @for (pc of state.scalePcs(); track $index) {
        <li class="chip" [class.root]="$index === 0">
          {{ pc | noteName: state.notation() }}
          <span class="deg">{{ degreeLabel($index) }}</span>
        </li>
      }
    </ul>
  `,
})
export class ScalePage {
  protected readonly state = inject(MusicState);

  protected degreeLabel(index: number): string {
    return this.state.isHeptatonic() ? ROMAN_DEGREES[index] : String(index + 1);
  }
}
