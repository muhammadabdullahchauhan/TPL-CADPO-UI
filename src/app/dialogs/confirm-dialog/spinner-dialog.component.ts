import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { ApplicationData } from 'src/app/classes/application';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: '../../../assets/htmls/confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css']
})
export class SpinnerDialogComponent implements OnInit {
  title: string;
  message: string;
  confirmation: boolean = false;
  buttons : any;

  constructor(public dialogRef: MatDialogRef<SpinnerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SpinnerDialogModel) {
    // Update view with given values
    this.title = data.title;
    this.message = data.message;
    this.buttons = ApplicationData.labeling.localization.buttons;
  }

  ngOnInit() {
  }

  onConfirm(): void {
    // Close the dialog, return true
    this.dialogRef.close(true);
  }

  onDismiss(): void {
    console.log("onDismiss");
    // Close the dialog, return false
    this.dialogRef.close(false);
  }
}

/**
 * Class to represent confirm dialog model.
 *
 * It has been kept here to keep it as part of shared component.
 */
export class SpinnerDialogModel {

  constructor(public title: string, public message: string,public confirmation: boolean) {
  }
}
