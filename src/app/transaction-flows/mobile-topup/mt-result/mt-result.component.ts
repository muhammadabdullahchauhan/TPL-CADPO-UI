import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AppComponent } from 'src/app/app.component';
import { DataService } from 'src/app/classes/DataService';
import { clearTransactionSession, getAccountTitle, getbillingCompanyName, getDepositMethod,  getMobileNumber,  getTransactionNumber, getTransactionStatus, getTransactionStatusCode, logoutCustomer, setTransactionStatus } from 'src/app/classes/GlobalFunctions';
import { speak } from 'src/app/classes/Initializer';
import { ApplicationData } from 'src/app/classes/application';
import { SpinnerService } from 'src/app/dialogs/loading-dialog/spinner.service';
import { WebResponseService } from 'src/app/web-response.service';

@Component({
  selector: 'app-mt-result',
  templateUrl: './mt-result.component.html',
  styleUrls: ['./mt-result.component.css']
})
export class MtResultComponent {

  mobileNum: any;
  amount: any;
  spinner: any;
  skipReceipt: boolean = false;
  activeBtn: string = '';
  areButtonsVisible: boolean = true;
  isCashStuck: boolean = false;
  btnIsBusy: boolean = false;
  recieptPending: boolean = true;
  defaultTimer: any;
  componentLabeling: any;
  apiData: any;
  isSuccess: any;
  confirmationMessage = "";
  TransactionNo: any;
  t_id: any;
  denominations: any;
  denominationsArray = new Array();
  companyName: any;

  @Output() innerSteps = new EventEmitter<any>();

  constructor(private dataService: DataService, private _router: Router, private apiResponse: WebResponseService, private util: AppComponent, private spinnerService: SpinnerService) {

    this.isCashStuck = ApplicationData.sessionTransaction.isCashStuck || false;
    if (this.isCashStuck) {
      this.areButtonsVisible = false;
    }

    this.isSuccess = ApplicationData.sessionTransaction.responseBehavior.isSuccess;
    this.componentLabeling = ApplicationData.labeling.transaction_result;

    this.skipReceipt = ApplicationData.sessionTransaction.skippingReceipt;

    if (!this.skipReceipt) {
      if (getTransactionStatusCode() == "99" || getTransactionStatusCode() == "02" || this.isCashStuck) {
        this.printCommand();
        this.recieptPending = false;
      }
    }

    if (!ApplicationData.sessionTransaction.skippingReceipt) {
      this.confirmationMessage = "Would you like to print transaction receipt?";
    }
    else {
      this.confirmationMessage = "Would you like to perform another trasaction?";

    }

    // Uncomment if Necessary

    // ApplicationData.customer.collectedAmount = this.amount - billAmount;
    // console.log('Wallet Amount:', ApplicationData.customer.collectedAmount);




    this.mobileNum = getMobileNumber();
    this.TransactionNo = getTransactionNumber();
    this.companyName = getbillingCompanyName();
    this.amount = sessionStorage.getItem("currentAmount");

    if (getTransactionStatus() == "Success" || getTransactionStatus() == "Pending") {
      localStorage.setItem("refreshed", "result");
      this.takePicture();

      console.log(this.amount);
      this.t_id = getTransactionNumber();
      if (getDepositMethod() == ApplicationData.depositMethods._CASH || getDepositMethod() == ApplicationData.depositMethods._CASH_BILL_PAYMENT) {

        if (sessionStorage.getItem("denomText") != null) {
          this.denominations = sessionStorage.getItem("denomText");
          this.denominationsArray = this.denominations.split(',');
        }



      }

      //   this.printConfirmation();
      //   this.spinner = this.spinnerService.start(WebResponseService.messages.msg_loading_start_cash_transaction.message);
      this.util.spinnerStart(WebResponseService.messages.msg_loading_start_cash_transaction.message);


      if (!ApplicationData.sessionTransaction.denominationsStacked) {

        if (getDepositMethod() == ApplicationData.depositMethods._CASH_VAS_MOBILE_TOPUP && ApplicationData.perefernces.batchCapacity != "Full") {

          this.dataService.subject.next("Cash drop pending");
          //   this.transactionType = "CASH";
          this.skipReceipt = true;
          this.apiResponse.updateTransactionStatus("Suspect", []).subscribe((statusResponse: any) => {
            this.printCommand();
          }, err => {
            this.printCommand();
          });
          setTransactionStatus("Success");
          this.util.spinnerStop();
          setTimeout(() => {
            this.endTransaction();
          }, 4000);

          return;

        }
      }

      else {
        setTransactionStatus("Success");
        this.finalizingTransaction();
        this.spinnerService.stop(this.spinner);
        this.util.spinnerStop();

        //  this.dataService.subject.next("Stack Status Success");
        setTimeout(() => {
          this.dataService.subject.next("Transaction: #" + this.t_id);
        }, 1000);
        if (this.skipReceipt) {
          setTimeout(() => {
            this.endTransaction();
          }, 4000);
        }
      }
    }

    setTimeout(() => {
      if (!ApplicationData.sessionTransaction.skippingReceipt) {
        this.innerSteps.emit(1);
      }
      else {
        this.innerSteps.emit(2);
      }
    }, 1000);

    this.defaultTimer = setTimeout(() => {
      this.endTransaction();
    }, 10000);
  }

  printCommand() {
    this.activeBtn = 'print';
    this.btnIsBusy = true;
    setTimeout(() => {
      this.btnIsBusy = false;
    }, 2000);

    clearTimeout(this.defaultTimer);
    this.printReceipt(res => {
      if (res) {
        this.dataService.subject.next("Receipt Printed");
        speak(this.componentLabeling.text_to_speech.collect_receipt);
      }
      else {
        this.dataService.subject.next("Receipt Printing Error");
      }

      setTimeout(() => {
        this.endTransaction();
      }, 1000);
    });
  }

  printReceipt(callback: Function) {

    if (ApplicationData.sessionTransaction.skippingReceipt) {
      callback(false);
    }

    this.apiResponse.printTransactionReceipt().subscribe((data) => {
      this.apiData = data;
      console.log(this.apiData);
      if (this.apiData.code == "0000" || this.apiData.code == "RCPT_PTR_0000") {

        callback(true);
        this.apiResponse.ledToggle(ApplicationData.ledArray._LED_RECEIPT_PRINTER, ApplicationData.ledArray._LED_OPTION_BLINK).subscribe((data) => {
          setTimeout(() => {
            this.apiResponse.ledToggle(ApplicationData.ledArray._LED_RECEIPT_PRINTER, ApplicationData.ledArray._LED_OPTION_OFF).subscribe((data) => {

            });
          }, 4000);
        });
      }
      else {
        this.dataService.subject.next("Receipt Printing Result: " + this.apiData.code);
      }
      clearTransactionSession();
    }, (err: any) => {
      clearTransactionSession();
      this.dataService.subject.next("Receipt Printing Result: " + err["code"]);
      callback(false);
    });


  }

  skipPrint() {
    this.activeBtn = 'green';
    this.dataService.subject.next("Receipt Printing Skipped");
    this.btnIsBusy = true;
    setTimeout(() => {
      this.btnIsBusy = false;
    }, 2000);
    this.endTransaction();
  }

  takePicture() {
    this.util.takePicture("Mobile TopUp");
  }

  finalizingTransaction() {

    ApplicationData.customer.collectedAmount = 0;
    if (!WebResponseService.settings.session_maintain) {
      logoutCustomer();
    }
    console.log(this.componentLabeling.text_to_speech.greeting);
    speak(this.componentLabeling.text_to_speech.greeting);
  }

  endTransaction() {
    clearTimeout(this.defaultTimer);
    this._router.navigate(['thankyou']);
  }
}

