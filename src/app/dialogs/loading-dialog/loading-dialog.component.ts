import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-loading-dialog',
  templateUrl: '../../../assets/htmls/loading-dialog.component.html',
  styleUrls: ['./loading-dialog.component.css']
})
export class LoadingDialogComponent {
  isVisible: boolean = true;
  constructor(
    public dialogRef: MatDialogRef<LoadingDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
}
