import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { LoadingDialogComponent } from './loading-dialog.component';

@Injectable()
export class SpinnerService {

    constructor(private router: Router, private dialog: MatDialog) {

    }

    start(message?: string | undefined): MatDialogRef<LoadingDialogComponent> {
     //   this.dialog.closeAll();
        const dialogRef = this.dialog.open(LoadingDialogComponent, {
            disableClose: true,
            data: message == '' || message == undefined ? "Loading..." : message
        });
        return dialogRef;
    };

    stop(ref: MatDialogRef<LoadingDialogComponent>) {
        if (ref != undefined && ref != null) {
            ref.close();
        }
    }
}  