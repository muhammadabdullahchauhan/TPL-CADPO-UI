import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AppComponent } from 'src/app/app.component';
import { DataService } from 'src/app/classes/DataService';
import { clearTransactionSession, getAccountTitle, getDepositMethod,  getTransactionNumber, getTransactionStatus, getTransactionStatusCode, logoutCustomer, setTransactionStatus, getAccountNumber, getbankName } from 'src/app/classes/GlobalFunctions';
import { speak } from 'src/app/classes/Initializer';
import { ApplicationData } from 'src/app/classes/application';
import { SpinnerService } from 'src/app/dialogs/loading-dialog/spinner.service';
import { WebResponseService } from 'src/app/web-response.service';
import { checkSpecificDeviceHealth } from 'src/app/classes/GlobalFunctions';

@Component({
  selector: 'app-cd-other-banks-result',
  templateUrl: './cd-other-banks-result.component.html',
  styleUrls: ['./cd-other-banks-result.component.css']
})
export class CdOtherBanksResultComponent {
  accountTitle: any;
  amount: any;
  spinner: any;
  skipReceipt: boolean = false;
  btnIsBusy: boolean = false;
  recieptPending: boolean = true;
  areButtonsVisible: boolean = true;
  defaultTimer: any;
  componentLabeling: any;
  apiData: any;
  isSuccess: any;
  confirmationMessage = "";
  t_id: any;
  denominations: any;
  denominationsArray = new Array();
  accountNumber: string;
  transactionNumber: string;
  bankName: string;
  activeBtn: string = '';
  isCashStuck: boolean = false;

  @Output() innerSteps = new EventEmitter<any>();

  constructor(private dataService: DataService, private _router: Router, private apiResponse: WebResponseService, private util: AppComponent, private spinnerService: SpinnerService) {

    this.isCashStuck = ApplicationData.sessionTransaction.isCashStuck || false;
    if (this.isCashStuck) {
      this.areButtonsVisible = false;
    }
    this.isSuccess = ApplicationData.sessionTransaction.responseBehavior.isSuccess;
    this.componentLabeling = ApplicationData.labeling.transaction_result;

    this.skipReceipt = ApplicationData.sessionTransaction.skippingReceipt;

    // if (!this.skipReceipt) {
    //   if (getTransactionStatusCode() == "99" || getTransactionStatusCode() == "02") {
    //     this.printCommand();
    //     this.recieptPending = false;
    //   }
    // }

    if (!ApplicationData.sessionTransaction.skippingReceipt) {
      this.confirmationMessage = "Would you like to print transaction receipt?";
    }
    else {
      this.confirmationMessage = "Would you like to perform another trasaction?";

    }


    this.accountNumber = getAccountNumber();
    this.transactionNumber = getTransactionNumber();
    this.accountTitle = getAccountTitle();
    this.amount = sessionStorage.getItem("currentAmount");
    this.bankName = getbankName();
    this.checkDeviceHealth();

    if (
      getTransactionStatusCode() != "99" &&
      getTransactionStatusCode() != "02" &&
      getTransactionStatusCode() != "00"
    ) {
      this.recieptPending = false;
      this.isSuccess = false;
    
      this.apiResponse.acceptorRejectCash().subscribe(
        (res: any) => {
          const stackDetail: any[] = [];
          if (res["code"] === "CSH_ACP_0000") {
            this.dataService.subject.next("CASH RETURNED");
    
            this.apiResponse.updateTransactionStatus("Success", stackDetail).subscribe(
              (statusResponse: any) => {
                this.apiResponse.TWARE_endTransaction().subscribe(
                  async (endTransactionResponse: any) => {
                    if (endTransactionResponse["statusCode"] === "00") {
                      sessionStorage.removeItem("TWARE_transactionId");
                    }
                  }
                );
              },
              (err) => {
                setTransactionStatus("Suspect");
                this.dataService.subject.next("Transaction Suspected");
              }
            );
          } else {
            this.dataService.subject.next("ERROR IN REJECTING CASH");
    
            this.apiResponse.updateTransactionStatus("Failed", stackDetail).subscribe(
              (statusResponse: any) => {
                setTransactionStatus("Suspect");
                this.printCommand();
                this.apiResponse.TWARE_endTransaction().subscribe(
                  async (endTransactionResponse: any) => {
                    if (endTransactionResponse["statusCode"] === "00") {
                      sessionStorage.removeItem("TWARE_transactionId");
                    }
                  }
                );
              },
              (err) => {
                setTransactionStatus("Suspect");
                this.dataService.subject.next("Transaction Suspected");
              }
            );
          }
    
          this.endTransaction();
        },
        (err) => {
          this.dataService.subject.next("ERROR IN REJECTING CASH");
          this.endTransaction();
        }
      );
    
      return;
    } else if (!this.skipReceipt) {
      if (getTransactionStatusCode() == "99" || getTransactionStatusCode() == "02") {
        this.printCommand();
        this.recieptPending = false;
      }
    }

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

        if (getDepositMethod() == ApplicationData.depositMethods._CASH && ApplicationData.perefernces.batchCapacity != "Full") {

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

  checkDeviceHealth() {
    const deviceHealth = checkSpecificDeviceHealth("Receipt Printer");

    if (deviceHealth !== "OK") {
      this.areButtonsVisible = false; // Hide buttons if device is not OK
    } else {
      this.areButtonsVisible = true; // Show buttons if device is OK
    }
  }

  printCommand() {
    this.activeBtn = 'print';
    this.btnIsBusy = true;
    setTimeout(() => {
      this.btnIsBusy = false;
    }, 20000);

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
          callback(false);
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
    this.util.takePicture("Transaction Summary");
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
