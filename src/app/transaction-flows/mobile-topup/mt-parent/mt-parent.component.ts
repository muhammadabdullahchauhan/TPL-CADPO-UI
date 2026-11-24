import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ApplicationData } from 'src/app/classes/application';
import { clearTransactionSession, consoleLog, logoutCustomer, setTransactionStatus } from 'src/app/classes/GlobalFunctions';
import { WebResponseService } from 'src/app/web-response.service';
import { DataService } from 'src/app/classes/DataService';
import { Initializer, speak } from 'src/app/classes/Initializer';
import { AppComponent } from 'src/app/app.component';
import { Subscription } from 'rxjs';
import { MockService } from 'src/app/classes/MockService/mock-service.service';
// Child Components
import { CnicInputComponent } from 'src/app/cnic-input/cnic-input.component';
import { MtTopupCompaniesComponent } from '../mt-topup-companies/mt-topup-companies.component';
import { MtTransactionInputComponent } from '../mt-transaction-input/mt-transaction-input.component';
import { MtReviewComponent } from '../mt-review/mt-review.component';
import { MtResultComponent } from '../mt-result/mt-result.component';

@Component({
  selector: 'app-mt-parent',
  templateUrl: './mt-parent.component.html',
  styleUrls: ['./mt-parent.component.css']
})
export class MtParentComponent implements OnInit, OnDestroy {
  stepper: boolean = true;
  stepperSteps = 0;
  stepCount = 0;
  innerSteps = 0;
  outerSteps = 0;
  buttonStateDisabled: boolean = false;
  isHardwareBusy: boolean = false;
  onceDeposited: boolean = false;
  nextBtnTimout: any;
  prevBtnTimeout: any;
  abandonedSubscription: Subscription;
  cancellationSubscription: Subscription;
  cashDepositSubscription: Subscription;



  @ViewChild(CnicInputComponent) biometricVerification: CnicInputComponent;
  @ViewChild(MtTopupCompaniesComponent) topUpCompanies: MtTopupCompaniesComponent;
  @ViewChild(MtTransactionInputComponent)beneficiaryDetail: MtTransactionInputComponent;
  @ViewChild(MtReviewComponent) reviewComponent: MtReviewComponent;
  @ViewChild(MtResultComponent) resultComponent: MtResultComponent;



  constructor(
    private _router: Router,
    private apiResponse: WebResponseService,
    private mock: MockService,
    private dataService: DataService,
    private initService: Initializer,
    private util: AppComponent
  ) {
    this.cancellationSubscription = this.dataService.onTransactionCancel().subscribe(data => {
      console.log("listener onTransactionCancel:", data);
      if (data == "customer") {
        this.btnCancelTransaction();
      } else {
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
    });
  }

  ngOnInit(): void {
    localStorage.setItem("refreshed", "txn-parent");
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


  btnCancelTransaction() {
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
        consoleLog("transaction-review.component.ts", "Open Shutter", shutterResponse);
        this.apiResponse.updateTransactionStatus("Cancelled", []).subscribe((res: any) => { });
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


  btnNext() {
    console.log("btnNext");
    if (ApplicationData.perefernces.pendingResponse) {
      return;
    }
    clearTimeout(this.nextBtnTimout);
    this.buttonStateDisabled = true;
    this.nextBtnTimout = setTimeout(() => {
      this.buttonStateDisabled = false;
    }, 350);
    console.log(this.stepCount);
    switch (this.stepCount) {
      case 0:
        this.biometricVerification.verifyingBiometric();
        this.outerSteps++;
        break;
      case 1:
        if (this.topUpCompanies.proceed()) {
          this.stepCount++;
        }

        break;
      case 2:
        this.beneficiaryDetail.proceed();
        break;
      case 3:
      
        this.reviewComponent.proceed();

        break;
      case 4:
        if (sessionStorage.getItem("currentAmount") && sessionStorage.getItem("currentAmount") != "0") {
        } else {
          this.util.dialog("Oops!", "Please deposit amount to continue", ApplicationData.dialogType._MESSAGE, ApplicationData.dialogIcon._WARNING, () => { });
        }
        break;
      default:
        break;
    }
  }

  logAndBtnPrev() {
    console.log('Button clicked, calling btnPrev');
    this.btnPrev();
  }

  btnPrev() {
    console.log(`btnPrev called with stepCount: ${this.stepCount}, outerSteps: ${this.outerSteps}`);
    if (ApplicationData.perefernces.pendingResponse) {
      console.log('Pending response, exiting btnPrev');
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
        console.log('Case 0: Cancelling transaction');
        this.btnCancelTransaction();
        break;
      case 1:
        console.log('Case 1: Checking outerSteps');
        if (this.outerSteps == 1) {
          // console.log('outerSteps is 1, calling stepback and decrementing outerSteps');
          // this.categoryAndCompanies.stepback();
          // this.outerSteps--;
        } else {
          console.log('outerSteps is not 1, cancelling transaction');
          this.btnCancelTransaction();
        }
        break;
      case 2:
        console.log('Case 2: Decrementing stepperSteps and stepCount');
        this.stepperSteps--;
        this.stepCount--;
        break;
      case 3:
        console.log('Case 3: Decrementing stepperSteps and stepCount');
        this.stepperSteps--;
        this.stepCount--;
        break;
  
      case 4:
        console.log('Case 4: Decrementing stepperSteps and stepCount');
        this.stepperSteps--;
        this.stepCount--;
        if (ApplicationData.customer.authorized) {
          console.log('Customer authorized, further decrementing stepperSteps and stepCount');
          this.stepperSteps--;
          this.stepCount--;
        }
        break;
  
      default:
        console.log('Default case: No action');
        break;
    }
  }
  


}
