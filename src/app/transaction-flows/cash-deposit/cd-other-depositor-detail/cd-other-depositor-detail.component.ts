import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { CnicInputComponent } from 'src/app/cnic-input/cnic-input.component';

@Component({
  selector: 'cd-other-depositor-detail',
  templateUrl: './cd-other-depositor-detail.component.html',
  styleUrls: ['./cd-other-depositor-detail.component.css']
})
export class CdOtherDepositorDetailComponent {
  @Output() componentResult = new EventEmitter<any>();
  @ViewChild(CnicInputComponent) cnicInput: CnicInputComponent;

  returnResult(resultData: any) {
    this.componentResult.emit(resultData);
  }

  verifyBio() {
    this.cnicInput.verifyingBiometric();
  }
}
