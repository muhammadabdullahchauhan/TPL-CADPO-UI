import { Component, ElementRef, Inject, OnDestroy, Renderer2 } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { Initializer } from 'src/app/classes/Initializer';

import { ApplicationData } from 'src/app/classes/application';

@Component({
  selector: 'app-modal-interface',
  templateUrl: '../../../assets/htmls/modal-interface.component.html',
  styleUrls: ['./modal-interface.component.css']
})
export class ModalInterfaceComponent implements OnDestroy {

  appDataSubscription!: Subscription;
  showModal: boolean = false;
  modalBundle = {
    title: "",
    message: "",
    modalType: "",
    icon: "",
    content: null
  }
  buttons: any;
  btnIsBusy: boolean = false;


  constructor(private el: ElementRef, private renderer: Renderer2, private initService: Initializer, public dialogRef: MatDialogRef<ModalInterfaceComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ModalInterfaceModel) {
    this.modalBundle.title = data.title;
    this.modalBundle.message = data.message;
    this.modalBundle.modalType = data.modalType;
    this.modalBundle.icon = data.icon;
    this.modalBundle.content = data.content;
    if (ApplicationData.labeling) {
      this.buttons = ApplicationData.labeling.localization.buttons;
    }
    else {
      this.buttons = {
        yes: "Yes",
        no: "No",
        okay: "Okay"
      }
    }


    // this.appDataSubscription = this.app.modalData$.subscribe(
    //   (data) => {
    //     if (data != undefined && data != null) {
    //       this.modalBundle = data;
    //       this.showModal = true;

    //     }

    //   }
    // );
  }
  ngOnDestroy(): void {
    console.log("Modal Dimissed");
  }

  ngOnInit() {
  }

  onConfirm(): void {
    this.btnIsBusy = true;
    setTimeout(() => {
      this.btnIsBusy = false;
    }, 2000);
    // Close the dialog, return true
    console.log("onConfirm");
    const targetDiv = this.el.nativeElement.querySelector('#notification-modal');
    this.renderer.addClass(targetDiv, 'modal-dismiss');
    setTimeout(() => {
      this.dialogRef.close(true);
    }, 200);


  }

  onDismiss(): void {
 
    this.btnIsBusy = true;
    setTimeout(() => {
      this.btnIsBusy = false;
    }, 2000);
    console.log("onDismiss");
    // Close the dialog, return false
    const targetDiv = this.el.nativeElement.querySelector('#notification-modal');
    this.renderer.addClass(targetDiv, 'modal-dismiss');
    setTimeout(() => {
      this.dialogRef.close(false);
    }, 200);

  }


  // hideModal() {
  //   const targetDiv = this.el.nativeElement.querySelector('#notification-modal');
  //   this.renderer.addClass(targetDiv, 'modal-dismiss');
  //   setTimeout(() => {
  //     this.showModal = false;
  //   }, 200);

  // }

}


export class ModalInterfaceModel {

  constructor(public title: string, public message: string, public modalType, public icon, public content = null) {
  }


}
