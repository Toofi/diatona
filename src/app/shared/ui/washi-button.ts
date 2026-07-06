import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type WashiPattern = 'plain' | 'shibori' | 'ichimatsu' | 'kiku' | 'seigaiha' | 'sakura' | 'shima';

/**
 * Dresses a native <button> or <a> as washi tape,
 * with the cream label sitting on top of the pattern.
 */
@Component({
  selector: 'button[diaWashi], a[diaWashi]',
  template: `<span class="tag"><ng-content /></span>`,
  host: { '[class]': 'classes()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WashiButton {
  readonly pattern = input<WashiPattern | ''>('', { alias: 'diaWashi' });

  protected readonly classes = computed(() => `tape tape-${this.pattern() || 'plain'}`);
}
