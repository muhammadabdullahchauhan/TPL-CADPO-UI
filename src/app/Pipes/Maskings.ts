import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mask'
})
export class MaskPipe implements PipeTransform {
  transform(value: string): string {
    const visibleCharactersFromStart = 4;
    const visibleCharactersFromEnd = 4;
    const maskedCharacters = value.length - visibleCharactersFromStart - visibleCharactersFromEnd;
    const maskedValue =
      value.substr(0, visibleCharactersFromStart) +
      '*'.repeat(maskedCharacters) +
      value.substr(value.length - visibleCharactersFromEnd);
    return maskedValue;
  }
  billTransform(value: string): string {
    const visibleCharactersFromStart = 2;
    const visibleCharactersFromEnd = 2;
    const maskedCharacters = value.length - visibleCharactersFromStart - visibleCharactersFromEnd;
    const maskedValue =
      value.substr(0, visibleCharactersFromStart) +
      '*'.repeat(maskedCharacters) +
      value.substr(value.length - visibleCharactersFromEnd);
    return maskedValue;
  }
}
