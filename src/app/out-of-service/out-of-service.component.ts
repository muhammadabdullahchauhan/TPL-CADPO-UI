import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { ApplicationData } from '../classes/application';
import { LogMethod, clearTerminalData, consoleLog, initializeEnvironment, logoutCustomer } from '../classes/GlobalFunctions';

import { WebResponseService } from '../web-response.service';
import { DataService } from '../classes/DataService';
import { AppComponent } from '../app.component';
import { MockService } from '../classes/MockService/mock-service.service';
import { Initializer } from '../classes/Initializer';
import { stopStatusService } from '../classes/DeviceHealth';
import { ModalInterfaceModel, ModalInterfaceComponent } from '../dialogs/modal-interface/modal-interface.component';
import { MatDialog } from '@angular/material/dialog';


@Component({
  selector: 'app-out-of-service',
  templateUrl: '../../assets/htmls/out-of-service.component.html',
  styleUrls: ['./out-of-service.component.css']
})
export class OutOfServiceComponent {

  heading: any;
  message: any;
  tokenTWARE = "";
  spinner: any;
  envoirnmentChecker!: Subscription;
  sensorsChecker!: Subscription;
  heartbeat: any;
  heartbeatChecker!: Subscription;
  dialogData: any;
  dialogRef: any;

  hiddenLeft: any = 0;
  supervisorySecondStepTimeout: any;
  supervisoryGestureTimeout: any;


  constructor(private apiResponse: WebResponseService, private mock: MockService, public dialogService: MatDialog, private initService: Initializer, private router: Router, private _router: Router, private app: AppComponent, private dataService: DataService) {

   // document.querySelector(".lang-selected-div")?.classList.add("slide-in-top");
    ApplicationData.perefernces.inservice = false;
  }

  ngOnInit() {
    ApplicationData.perefernces.lastServiceStatus = "OUT OF SERVICE";
    if (ApplicationData.sessionTransaction.systemreferencenumber == "") {
      this.dataService.subject.next("Out of service\n\n");
    }
    localStorage.setItem("refreshed", "outofservice");
    clearTerminalData();
    this.heading = "Attention!";
    this.message = "Sorry, This Machine is Temporarily Out of Service";
    
  }

  hiddenClick(btn) {
    if (btn == "left") {
      if (this.hiddenLeft == 0) {
        this.supervisoryGestureTimeout = setTimeout(() => {
          {
            this.hiddenLeft = 0;
          }
        }, 5000);
      }
      this.hiddenLeft = this.hiddenLeft + Number(1);
    }
    
    else if (btn == "right" && this.hiddenLeft == "3") {
      stopStatusService();
      //  this.initService.startMonitoring();
      //  ApplicationData.perefernces.superUser = true;

      const dialogData = new ModalInterfaceModel("Supervisory Authentication", "Perform next step in 15 seconds to proceed", ApplicationData.dialogType._SPINNER, ApplicationData.dialogIcon._INFO);
      const dialogRef = this.dialogService.open(ModalInterfaceComponent, {
        maxWidth: "700",
        data: dialogData
      });
      

      ApplicationData.perefernces.superUser = true;
      setTimeout(() => {
        dialogRef.close();
        ApplicationData.perefernces.superUser = false;
      }, 15000);

      dialogRef.disableClose = true;
      dialogRef.afterClosed().subscribe(dialogResult => {
        //  this.result = dialogResult;
        //    callback(dialogResult);
      });

      // this._router.navigate(['sup-login']);
      //  location.href = "http://localhost:3643/sup";
    }





  }

  
}   