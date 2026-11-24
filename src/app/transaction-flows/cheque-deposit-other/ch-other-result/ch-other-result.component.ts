import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AppComponent } from 'src/app/app.component';
import { DataService } from 'src/app/classes/DataService';
import { clearTransactionSession, getAccountNumber, getAccountTitle, getEnteredAmount, getTransactionNumber, getTransactionStatus, getTransactionStatusCode, logoutCustomer, setTransactionStatus, getChequeNo } from 'src/app/classes/GlobalFunctions';
import { speak } from 'src/app/classes/Initializer';
import { ApplicationData } from 'src/app/classes/application';
import { SpinnerService } from 'src/app/dialogs/loading-dialog/spinner.service';
import { WebResponseService } from 'src/app/web-response.service';
import { checkSpecificDeviceHealth } from 'src/app/classes/GlobalFunctions';

@Component({
  selector: 'ch-other-result',
  templateUrl: './ch-other-result.component.html',
  styleUrls: ['./ch-other-result.component.css']
})
export class ChdOtherResultComponent {
  accountTitle: any;
  amount: any;
  spinner: any;
  skipReceipt: boolean = false;
  btnIsBusy: boolean = false;
  areButtonsVisible: boolean = true; 
  receiptPending: boolean = true;
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
  chequeNo: string;
  isChequeParsed: boolean = false;
  isPending: boolean = false;
  parsedChequeData: any = null;
  activeBtn: string = '';

  @Output() innerSteps = new EventEmitter<any>();

  constructor(
    private dataService: DataService,
    private _router: Router,
    private apiResponse: WebResponseService,
    private util: AppComponent,
    private spinnerService: SpinnerService
  ) {
    this.isSuccess = ApplicationData.sessionTransaction.responseBehavior.isSuccess;
    this.componentLabeling = ApplicationData.labeling.transaction_result;
    this.skipReceipt = ApplicationData.sessionTransaction.skippingReceipt;

    // if (!this.skipReceipt && (getTransactionStatusCode() == "99" || getTransactionStatusCode() == "02")) {
    //   this.printCommand();
    //   this.receiptPending = false;
    // }

        this.accountNumber = getAccountNumber();
    this.transactionNumber = getTransactionNumber();
    this.accountTitle = getAccountTitle();
    this.chequeNo = getChequeNo();
    this.amount = sessionStorage.getItem("currentAmount") || getEnteredAmount();
    this.isChequeParsed = ApplicationData.sessionTransaction.isChequeParsed;
    this.parsedChequeData = ApplicationData.sessionTransaction.parsedChequeData;
    if (this.isChequeParsed && this.parsedChequeData && this.parsedChequeData.cheque_number) {
      this.chequeNo = this.parsedChequeData.cheque_number;
    }
    this.isPending = (getTransactionStatus() === "Pending") || (this.isSuccess && !this.isChequeParsed);
    if (this.isPending) {
      setTransactionStatus("Pending");
    }
    this.checkDeviceHealth();

    if (
      getTransactionStatusCode() != "99" &&
      getTransactionStatusCode() != "02" &&
      getTransactionStatusCode() != "00"
    ) {
      this.receiptPending = false;
      this.isSuccess = false;
      setTransactionStatus("Failed");
      this.util.spinnerStop();
    
      this.apiResponse.chequeCancel().subscribe(
        (res: any) => {
          if (res["code"] === "CHQ_ACP_0000") {
            this.dataService.subject.next("CHEQUE RETURN SUCCESS");
    
            this.apiResponse.updateTransactionStatus("Success", []).subscribe(
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
             this.dataService.subject.next("CHEQUE RETURN FAILED");
    
            this.apiResponse.updateTransactionStatus("Failed", []).subscribe(
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
    
          setTimeout(() => {
  this.endTransaction();
}, 6000); // delay in milliseconds

        },
        (err) => {
          this.dataService.subject.next("ERROR IN CHEQUE CANCELLATION");
          setTimeout(() => {
  this.endTransaction();
}, 6000); // delay in milliseconds

        }
      );
    
      return;
    } else if (!this.skipReceipt) {
      if (getTransactionStatusCode() == "99" || getTransactionStatusCode() == "02") {
        this.printCommand();
        this.receiptPending = false;
      }
    }
    

    if (!ApplicationData.sessionTransaction.skippingReceipt) {
      this.confirmationMessage = "Would you like to print the transaction receipt?";
    } else {
      this.confirmationMessage = "Would you like to perform another transaction?";
    }

    this.accountNumber = getAccountNumber();
    this.transactionNumber = getTransactionNumber();
    this.accountTitle = getAccountTitle();
    this.chequeNo = getChequeNo();
    this.amount = sessionStorage.getItem("currentAmount");
    this.isChequeParsed = ApplicationData.sessionTransaction.isChequeParsed;
    this.parsedChequeData = ApplicationData.sessionTransaction.parsedChequeData;
    if (this.isChequeParsed && this.parsedChequeData && this.parsedChequeData.cheque_number) {
      this.chequeNo = this.parsedChequeData.cheque_number;
    }

    if (getTransactionStatus() === "Success" || getTransactionStatus() === "Pending") {
      localStorage.setItem("refreshed", "result");
      this.takePicture();

      this.t_id = getTransactionNumber();
      this.util.spinnerStart(WebResponseService.messages.msg_loading_start_cash_transaction.message);

      if (!ApplicationData.sessionTransaction.denominationsStacked) {
        this.dataService.subject.next("Cheque drop pending");
        this.skipReceipt = true;
        this.apiResponse.updateTransactionStatus("Suspect", []).subscribe(
          (statusResponse: any) => {
            this.printCommand();
          },
          (err) => {
            this.printCommand();
          }
        );
        if (this.isPending) {
          setTransactionStatus("Pending");
        } else {
          setTransactionStatus("Success");
        }
        this.util.spinnerStop();
        setTimeout(() => {
          this.endTransaction();
        }, 4000);
        return;
      } else {
        if (this.isPending) {
          setTransactionStatus("Pending");
        } else {
          setTransactionStatus("Success");
        }
        this.finalizingTransaction();
        this.spinnerService.stop(this.spinner);
        this.util.spinnerStop();
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
      } else {
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
    }, 20000);

    clearTimeout(this.defaultTimer);
    this.printReceipt((res: boolean) => {
      if (res) {
        this.dataService.subject.next("Receipt Printed");
        speak(this.componentLabeling.text_to_speech.collect_receipt);
      } else {
        this.dataService.subject.next("Receipt Printing Error");
      }

      setTimeout(() => {
        this.endTransaction();
      }, 1000);
    });
  }

  // printReceipt(callback: Function) {
  //   if (ApplicationData.sessionTransaction.skippingReceipt) {
  //     callback(false);
  //     return;
  //   }

  //   this.apiResponse.printTransactionReceipt().subscribe(
  //     (data: any) => {
  //       this.apiData = data;
  //       console.log(this.apiData);
  //       if (this.apiData.code === "0000" || this.apiData.code === "RCPT_PTR_0000") {
  //         callback(true);
  //         this.apiResponse
  //           .ledToggle(ApplicationData.ledArray._LED_RECEIPT_PRINTER, ApplicationData.ledArray._LED_OPTION_BLINK)
  //           .subscribe((data: any) => {
  //             setTimeout(() => {
  //               this.apiResponse
  //                 .ledToggle(ApplicationData.ledArray._LED_RECEIPT_PRINTER, ApplicationData.ledArray._LED_OPTION_OFF)
  //                 .subscribe((data: any) => {});
  //             }, 4000);
  //           });
  //       } else {
  //         this.dataService.subject.next("Receipt Printing Result: " + this.apiData.code);
  //       }
  //       clearTransactionSession();
  //     },
  //     (err: any) => {
  //       clearTransactionSession();
  //       this.dataService.subject.next("Receipt Printing Result: " + err.code);
  //       callback(false);
  //     }
  //   );
  // }

  checkDeviceHealth() {
    const deviceHealth = checkSpecificDeviceHealth("Receipt Printer");

    if (deviceHealth !== "OK") {
      this.areButtonsVisible = false; // Hide buttons if device is not OK
    } else {
      this.areButtonsVisible = true; // Show buttons if device is OK
    }
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
    if (this.isPending) {
      speak("Your transaction is pending. Your cheque will be deposited after verification");
    } else {
      console.log(this.componentLabeling.text_to_speech.greeting);
      speak(this.componentLabeling.text_to_speech.greeting);
    }
  }

  endTransaction() {
    clearTimeout(this.defaultTimer);
    this._router.navigate(["thankyou"]);
  }
}
