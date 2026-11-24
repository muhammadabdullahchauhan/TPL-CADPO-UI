import { Component, OnDestroy, OnInit, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { ApplicationData } from 'src/app/classes/application';
import { clearTransactionSession, consoleLog, logoutCustomer, setTransactionStatus } from 'src/app/classes/GlobalFunctions';
import { WebResponseService } from 'src/app/web-response.service';
import { DataService } from 'src/app/classes/DataService';
import { Initializer, speak } from 'src/app/classes/Initializer';
import { AppComponent } from 'src/app/app.component';
import { Subscription } from 'rxjs';
import { MockService } from 'src/app/classes/MockService/mock-service.service';
import { CnicInputComponent } from 'src/app/cnic-input/cnic-input.component';
// Child Components
import { UbpInputCnicComponent } from '../ubp-input-cnic/ubp-input-cnic.component';
import { UbpBillPaymentComponent } from '../ubp-bill-payment/ubp-bill-payment.component';
import { UbpTransactionInputComponent } from '../ubp-transaction-input/ubp-transaction-input.component';
import { UbpReviewComponent } from '../ubp-review/ubp-review.component';
import { UbpResultComponent } from '../ubp-result/ubp-result.component';

@Component({
  selector: 'app-ubp-parent',
  templateUrl: './ubp-parent.component.html',
  styleUrls: ['./ubp-parent.component.css']
})
export class UbpParentComponent implements OnInit, OnDestroy, OnChanges {
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
  @ViewChild(UbpBillPaymentComponent) categoryAndCompanies: UbpBillPaymentComponent;
  @ViewChild(UbpTransactionInputComponent) beneficiaryDetail: UbpTransactionInputComponent;
  @ViewChild(UbpReviewComponent) reviewComponent: UbpReviewComponent;
  @ViewChild(UbpResultComponent) resultComponent: UbpResultComponent;

  get isSubStepCompany(): boolean {
    return this.stepCount === 1 && !!(this.categoryAndCompanies && this.categoryAndCompanies.filteredCompaines);
  }

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
          // this.apiResponse.updateTransactionStatus("Abandoned", []).subscribe((res: any) => {
          //   this.dataService.subject.next("Transaction Abandoned");
          // }, err => {
          //   this.dataService.subject.next("Transaction Abandoned Error");
          // });
    
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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['stepCount'] && !changes['stepCount'].isFirstChange()) {
      this.performConditionalInit();
    }
  }

  performConditionalInit() {
    if (this.stepCount == 1) {
      if (this.categoryAndCompanies) {
        this.categoryAndCompanies.componentResult.subscribe(result => {
          if (result.selectedCategory) {
            this.outerSteps++;
          }
        });
      } else {
        const checkAvailability = setInterval(() => {
          if (this.categoryAndCompanies) {
            clearInterval(checkAvailability);
            this.categoryAndCompanies.componentResult.subscribe(result => {
              if (result.selectedCategory) {
                this.outerSteps++;
              }
            });
          }
        }, 100);
      }
    }
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
        if (!this.categoryAndCompanies?.filteredCompaines) {
          if (this.categoryAndCompanies?.goToNextStep()) {
            this.outerSteps = 1;
          }
        } else {
          if (this.categoryAndCompanies?.proceed()) {
            this.stepCount++;
            this.outerSteps = 0;
          }
        }
        break;
      case 2:
     
        this.beneficiaryDetail?.proceed();
        break;
      case 3:
      
        this.reviewComponent?.proceed();
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
        if (this.categoryAndCompanies?.filteredCompaines) {
          console.log('On company selection, calling stepback to category');
          this.categoryAndCompanies.stepback();
          this.outerSteps = 0;
        } else {
          console.log('On category selection, cancelling transaction');
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
      

        this.apiResponse.updateTransactionStatus(status, []).subscribe((res: any) => { });
        this.buttonStateDisabled = false;
             logoutCustomer();
      clearTransactionSession();
        this.util.spinnerStop();

        this._router.navigate([redirect]);
      }

    }
    else {
      this.dataService.subject.next("TRANSACTION CANCELLED");

      this.util.spinnerStop();
      this.apiResponse.updateTransactionStatus(status, []).subscribe((res: any) => { });
      this.buttonStateDisabled = false;
           logoutCustomer();
      clearTransactionSession();
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

  getFooterMarginTop(): number {
    switch (this.stepCount) {
      case 0:
        return 105; // Margin-top value for stepCount == 0
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
