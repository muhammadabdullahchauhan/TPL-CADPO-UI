import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'shared-numpad',
  templateUrl: '../../../assets/htmls/numpad.component.html',
  styleUrls: ['./numpad.component.css']
})
export class NumpadComponent {

  @Output() typeCharacter = new EventEmitter<any>();

  btnClick(value: any) {
    this.typeCharacter.emit(value);
  }
}
