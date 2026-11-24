import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { CnicInputComponent } from 'src/app/cnic-input/cnic-input.component';

@Component({
  selector: 'ch-other-depositor-detail',
  templateUrl: './ch-other-depositor-detail.component.html',
  styleUrls: ['./ch-other-depositor-detail.component.css']
})
export class ChdOtherDepositorDetailComponent {
  @Output() componentResult = new EventEmitter<any>();
  @ViewChild(CnicInputComponent) cnicInput: CnicInputComponent;

  returnResult(resultData: any) {
    this.componentResult.emit(resultData);
  }

  verifyBio() {
    this.cnicInput.verifyingBiometric();
  }
}
