import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ApplicationData } from 'src/app/classes/application';
import { checkSpecificDeviceHealth, clearTransactionSession, consoleLog, logoutCustomer, setTransactionStatus } from 'src/app/classes/GlobalFunctions';
import { WebResponseService } from 'src/app/web-response.service';
import { DataService } from 'src/app/classes/DataService';
import { Initializer} from 'src/app/classes/Initializer';
import { AppComponent } from 'src/app/app.component';
import { Subscription } from 'rxjs';
import { QrReviewComponent } from '../qr-review/qr-review.component';
import { MockService } from 'src/app/classes/MockService/mock-service.service';
import { CdOtherReviewComponent } from '../../cash-deposit/cd-other-review/cd-other-review.component';
import { CnicInputComponent } from 'src/app/cnic-input/cnic-input.component';
import { QrcQrCodeComponent } from '../qrc-qr-code/qrc-qr-code.component';

@Component({
  selector: 'app-qrc-parent',
  templateUrl: './qrc-parent.component.html',
  styleUrls: ['./qrc-parent.component.css']
})
export class QrcParentComponent implements OnInit, OnDestroy {
  stepper: boolean = true;
  isGifVisible: boolean = false; 
  stepperSteps = 0;
  stepCount = 0;
  innerSteps = 0;
  buttonStateDisabled: boolean = false;
  isHardwareBusy: boolean = false;
  onceDeposited: boolean = false;
  nextBtnTimout: any;
  prevBtnTimeout: any;
  abandonedSubscription: Subscription;
  cancellationSubscription: Subscription;
  cashDepositSubscription: Subscription;

  @ViewChild(QrcQrCodeComponent) Qrcode: QrcQrCodeComponent;
  @ViewChild(CnicInputComponent) biometricVerification: CnicInputComponent;
  @ViewChild(QrReviewComponent) reviewComponent: QrReviewComponent;



  constructor(private _router: Router, private apiResponse: WebResponseService, private mock: MockService, private dataService: DataService, private initService: Initializer, private util: AppComponent) {

    this.cancellationSubscription = this.dataService.onTransactionCancel().pipe().subscribe(data => {
      console.log("listner onTransactionCancel:" + data);


      if (data == "customer") {
        this.btnCancelTransaction();
      }
      else {
        this.performCancelTransaction(data);
      }

    });
    this.cashDepositSubscription = this.dataService.onCashDeposit().subscribe(data => {
      this.onceDeposited = true;
    });


    this.abandonedSubscription = this.dataService.onAbandonedCancel().subscribe(data => {
      this.util.spinnerStart("");
      setTransactionStatus("Abandoned");

      this.apiResponse.openCloseDropdoor(0).subscribe((res: any) => {

        if (res["code"] == "CSH_ACP_0000") {
          this.apiResponse.updateTransactionStatus("Success", []).subscribe((res: any) => {
            this.dataService.subject.next("Transaction Abandoned");
          }, err => {
            this.dataService.subject.next("Transaction Abandoned Error");
          });
          this.dataService.subject.next("DROP STATUS SUCCESS");
        }
        else {
          this.apiResponse.updateTransactionStatus("Failed", []).subscribe((res: any) => {
            this.dataService.subject.next("Transaction Abandoned");
          }, err => {
            this.dataService.subject.next("Transaction Abandoned Error");
          });
          this.dataService.subject.next("DROP STATUS FAILED");

        }
        this.util.spinnerStop();
        ApplicationData.customer.collectedAmount = 0;

        logoutCustomer();
        clearTransactionSession();
        //   this.dataService.subject.next("Transaction Ended");
        this._router.navigate(['thankyou']);

      });
    });

    this.dataService.onHardwareBusy().subscribe(data => {
      this.buttonStateDisabled = data;
      this.isHardwareBusy = data;
      ApplicationData.perefernces.pendingResponse = data;
      
      // Determine whether to show the GIF based on data and the cash acceptor status
      this.isGifVisible = data || ApplicationData.sessionTransaction.cashAcceptorIsBusy;
    });
    



  }
  ngOnDestroy(): void {

    if (this.abandonedSubscription) {
      this.abandonedSubscription.unsubscribe();
    }
    if (this.cancellationSubscription) {
      this.cancellationSubscription.unsubscribe();
    }
    if (this.cashDepositSubscription) {
      this.cashDepositSubscription.unsubscribe();
    }
  }
  ngOnInit(): void {
    localStorage.setItem("refreshed", "txn-parent");
  }

  updateStepper(result: any) {
    if (result == "canceltxn") {
      this.performCancelTransaction();
      return;
    }
    if (result.step == true) {
      this.stepperSteps++;
      this.stepCount++;

    }
    if (result.step == false) {
      this.stepperSteps--;
      this.stepCount--;
    }

    this.buttonStateDisabled = false;
  }

  updateInnerSteps(data: any) {
    this.innerSteps = data;
  }

  btnNext() {
    if (ApplicationData.perefernces.pendingResponse) {
      return;
    }

    clearTimeout(this.nextBtnTimout);
    this.buttonStateDisabled = true;
    this.nextBtnTimout = setTimeout(() => {
      this.buttonStateDisabled = false;

    }, 350);
    switch (this.stepCount) {
      case 0:
        this.biometricVerification.verifyingBiometric();
        break;
      case 1:
        // this.beneficiaryDetail.proceed();
        this.reviewComponent.proceed();
        break;

      case 2:
     
        break;

     

        break;
      default:
        break;
    }

  }
  btnPrev() {
    console.log(this.stepCount);
    if (ApplicationData.perefernces.pendingResponse) {
      return;
    }
    clearTimeout(this.prevBtnTimeout);
    this.buttonStateDisabled = true;
    this.prevBtnTimeout = setTimeout(() => {
      this.buttonStateDisabled = false;
    }, 350);
    this.innerSteps = 0;
    switch (this.stepCount) {
      case 0:
        this.btnCancelTransaction();
        break;

      case 1:
        if (ApplicationData.sessionTransaction.state.screens.cd_other_transaction_detail_last_step == 2) {
          ApplicationData.sessionTransaction.state.screens.cd_other_transaction_detail_last_step = 1;
        //  this.transactionDetail.selectingPurpose = false;
        }
        else {
          this.stepperSteps--;
          this.stepCount--;
        }
        break;
      case 2:

        this.stepperSteps--;
        this.stepCount--;

        break;
      case 3:
        this.stepperSteps--;
        this.stepCount--;
        if (ApplicationData.customer.authorized) {
          this.stepperSteps--;
          this.stepCount--;
        }
        break;

      default:
        break;
    }
  }

  btnCancelTransaction() {
    // if (this.buttonStateDisabled) {
    //   return;
    // }
    this.initService.startMonitoring();
    this.util.dialog("Confirmation", "Would you really like to cancel this transaction?", ApplicationData.dialogType._CONFIRMATION, ApplicationData.dialogIcon._WARNING, (res: any) => {
      console.log(res);
      console.log("304");
      if (res == true) {
        console.log("performCancelTransaction");
        this.performCancelTransaction("customer");
      }
    });
  }

  performCancelTransaction(status: any = "Cancelled") {

    if (ApplicationData.perefernces.pendingCancellation == true) {
      return;
    }
    ApplicationData.perefernces.pendingCancellation = true;
    this.initService.stopMonitoring();
    //this.dataService.subject.next("Transaction: " + status);
    this.buttonStateDisabled = true;
    this.util.dismissAllDialogues();
    this.util.spinnerStart("");
    let redirect = "thankyou";
    if (status == "OUT OF SERVICE") {
      status = "Cancelled";
      //      redirect = "out-of-service";
    }
    if (ApplicationData.sessionTransaction.systemreferencenumber != "") {

      this.dataService.pushCashDeposit(false);

      if (status == "customer") {
        this.dataService.subject.next("TRANSACTION CANCELLED BY CUSTOMER");
      }
      else {
        this.dataService.subject.next("TRANSACTION CANCELLED");
      }

      if (sessionStorage.getItem("currentAmount")) {

        this.openShutter((res: any) => {
          this.apiResponse.TWARE_endTransaction().subscribe((endTransactionResponse: any) => { });

          setTimeout(() => {
            //    this.dataService.subject.next("TRANSACTION ENDED");
          }, 1000);

          logoutCustomer();
          clearTransactionSession();
          this.util.spinnerStop();
          this.buttonStateDisabled = false;

          this._router.navigate([redirect]);

        });
      }
      else {
        //  this.spinnerService.stop(this.spinner);
        this.apiResponse.TWARE_endTransaction().subscribe((endTransactionResponse: any) => { });

        setTimeout(() => {
          //   this.dataService.subject.next("TRANSACTION ENDED");
        }, 1000);
        logoutCustomer();
        clearTransactionSession();

        this.apiResponse.updateTransactionStatus(status, []).subscribe((res: any) => { });
        this.buttonStateDisabled = false;
        this.util.spinnerStop();

        this._router.navigate([redirect]);
      }

    }
    else {
      this.dataService.subject.next("TRANSACTION CANCELLED");
      logoutCustomer();
      clearTransactionSession();
      this.util.spinnerStop();
      this.apiResponse.updateTransactionStatus(status, []).subscribe((res: any) => { });
      this.buttonStateDisabled = false;
      this._router.navigate([redirect]);
    }
  }

  openShutter(callback: Function) {
    //  speak(this.componentLabeling.text_to_speech.cancelCash);

    this.apiResponse.acceptorRejectCash().subscribe((shutterResponse: any) => {

      if (shutterResponse["code"] == "0000" || shutterResponse["code"] == "CSH_ACP_0000") {
        this.dataService.subject.next("CASH RETURNED SUCCESS");
        setTransactionStatus("Cancelled");
        consoleLog("transaction-review.component.ts", "Open Shutter", shutterResponse);
        this.apiResponse.updateTransactionStatus("Success", []).subscribe((res: any) => { });
        callback(true);
      }

      else if (shutterResponse["code"] == "CSH_ACP_0002") {
        let denom: any;
        if (sessionStorage.getItem("currentDenom")) {
          denom = JSON.parse(String(sessionStorage.getItem("currentDenom")))
        }
        else {
          denom = [];
        }
        this.apiResponse.updateTransactionStatus("Suspect", []).subscribe((res: any) => { });
        // this.apiResponse.updateCashAcceptorHealth(shutterResponse["errors"]["errorCode"], shutterResponse["errors"]["errorMessage"]);

        this.dataService.subject.next("CASH RETURN SUSPECT: " + shutterResponse["code"]);
        callback(false);
      }
      else {
        this.apiResponse.updateTransactionStatus("Suspect", []).subscribe((res: any) => { });
        //    this.apiResponse.updateCashAcceptorHealth(shutterResponse["errors"]["errorCode"], shutterResponse["errors"]["errorMessage"]);
        this.dataService.subject.next("CASH RETURN SUSPECT: " + shutterResponse["code"]);
        callback(false);
      }



    }, err => {
      this.apiResponse.updateTransactionStatus("Suspect", []).subscribe((res: any) => { });

      this.dataService.subject.next("Reject Cash Result: " + err["code"]);
      callback(false);
    });
  }

  getFooterMarginTop(): number {
    switch (this.stepCount) {
      case 0:
        return 1005; // Margin-top value for stepCount == 0
      case 1:
        return 975; // Margin-top value for stepCount == 1
      case 2:
        return 800; // Margin-top value for stepCount == 2
      case 3:
        return 700; // Margin-top value for stepCount == 3
      default:
        return 0; // Default margin-top value
    }
  }

  



}

