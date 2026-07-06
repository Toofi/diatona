import { Pipe, PipeTransform } from '@angular/core';
import { Notation, pcName } from '../../core/music';

@Pipe({ name: 'noteName' })
export class NoteNamePipe implements PipeTransform {
  transform(pc: number, notation: Notation): string {
    return pcName(pc, notation);
  }
}
