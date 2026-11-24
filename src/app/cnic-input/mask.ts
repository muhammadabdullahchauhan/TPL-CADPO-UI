// import {Directive,HostListener} from '@angular/core'

// @Directive({
// selector: '[dobMask]'
// })
// export class DobDirective {

// @HostListener('input', ['$event'])
// onKeyDown(event: KeyboardEvent) {
// const input = event.target as HTMLInputElement;

// let trimmed = input.value.replace(/\s+/g, '');

// if (trimmed.length > 15) {
//   trimmed = trimmed.substr(0, 15);
// }


// trimmed = trimmed.replace(/-/g,'');

//  let numbers = [];
 
//  numbers.push(trimmed.substr(0,5));
//  if(trimmed.substr(5,7)!=="")
//  numbers.push(trimmed.substr(5,7));
//  if(trimmed.substr(12,1)!="")
//  numbers.push(trimmed.substr(12,1));


// input.value = numbers.join('-');

//   }
// }