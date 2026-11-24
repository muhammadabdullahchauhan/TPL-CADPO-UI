import { Component, EventEmitter, Output, ViewChild, OnInit } from '@angular/core';
import { AppComponent } from 'src/app/app.component';
import { DataService } from 'src/app/classes/DataService';
import { consoleLog, getAccountNumber, getAccountTitle, getDepositMethod, getEnteredAmount, getMobileNumber, getTransactionPurposeId, setTransactionNumber, setTransactionResponseBehavior, setTransactionStatus, setTransactionStatusCode } from 'src/app/classes/GlobalFunctions';
import { Initializer, speak } from 'src/app/classes/Initializer';
import { ApplicationData } from 'src/app/classes/application';
import { CashAcceptorComponent } from 'src/app/transaction components/cash-acceptor/cash-acceptor.component';
import { WebResponseService } from 'src/app/web-response.service';

@Component({
  selector: 'app-cd-other-banks-review',
  templateUrl: './cd-other-banks-review.component.html',
  styleUrls: ['./cd-other-banks-review.component.css']
})
export class CdOtherBanksReviewComponent {

  componentLabeling: any;
  accountTitle = "";
  amount = "";
  accountNum = "";
  mobileNum = "";
  purpose = "";
  depositedCash: number = 0;
  responsePending: boolean = false;
  completingCall: boolean = false;
  cannotAddMoreCash: boolean = false;
  transactionPending: boolean = false;
  buttonStateDisabled: boolean = false;

  collectedCash: number;
  totalRejected: number;
  form_direction: any;

  walletAmount: string = "";
  showWalletAmount: boolean = false;

  @ViewChild(CashAcceptorComponent) cashAcceptor: CashAcceptorComponent;

  @Output() componentResult = new EventEmitter<any>();


  constructor(private util: AppComponent, private apiResponse: WebResponseService, private dataService: DataService, private initService: Initializer) {

    this.accountTitle = getAccountTitle();
    this.accountNum = getAccountNumber();
    this.mobileNum = getMobileNumber();
    this.amount = getEnteredAmount();
    this.purpose = getTransactionPurposeId();
    this.collectedCash = 0;
    this.totalRejected = 0;

    this.componentLabeling = ApplicationData.labeling.transaction_review;
    this.form_direction = ApplicationData.labeling.localization.settings.direction;
    speak(this.componentLabeling.text_to_speech.onload);
    this.initService.startMonitoring();

    this.updateWalletAmount();

  }

  updateWalletAmount() {
    const amount = ApplicationData.customer.collectedAmount;
    if (amount > 0) {
        // this.walletAmount = "Remaining: " + amount;
        this.walletAmount = amount.toString();

        this.showWalletAmount = true;
    } else {
        this.showWalletAmount = false;
    }
}

  setCashAmount(amount: any) {
    this.depositedCash = amount;
    sessionStorage.setItem("currentAmount", amount);
    this.responsePending = false;
    this.transactionPending = true;
  }

  takePicture() {
     this.util.takePicture("Cash Accept");
  }

  remainingAmount(): number {
    const amountValue = Number(this.amount) || 0; // Convert to number, default to 0 if NaN
    const depositedCashValue = Number(this.depositedCash) || 0; // Convert to number, default to 0 if NaN
    const wallet = Number(this.walletAmount) || 0; // Convert to number, default to 0 if NaN
    
    const remaining = amountValue - (depositedCashValue + wallet);
    return Math.max(remaining, 0); // Ensure it does not show negative values
}

  

public completeTransaction() {
  if (ApplicationData.sessionTransaction.isCashStuck) {
    this.buttonStateDisabled = true;
    this.completingCall = true;
    this.performTransaction();
    return;
  }
  if (getDepositMethod() === ApplicationData.depositMethods._CASH) {
    // Skip the dialog if collected amount is greater than 0 and depositedCash is 0, and proceed with the transaction
    if (ApplicationData.customer.collectedAmount > 0 && this.depositedCash == 0) {
      this.depositedCash += ApplicationData.customer.collectedAmount;
      sessionStorage.setItem("currentAmount", this.depositedCash.toString());
      this.performTransaction();
      return;
    }

    // Check if deposited cash differs from the entered amount
    if (this.depositedCash !== Number(this.amount)) {
      let concatMessage = this.depositedCash < Number(this.amount) ? "less" : "greater";

      // Prepare dialog message based on collected amount
      let dialogMessage = ApplicationData.customer.collectedAmount > 0
        ? `The Deposit amount is ${this.depositedCash} and the balance in your wallet is ${ApplicationData.customer.collectedAmount}. The sum of both is ${concatMessage} than the entered amount of ${getEnteredAmount()}. Would you like to proceed with the current amount or cancel?`
        : `The Deposit amount of ${this.depositedCash} is ${concatMessage} than the entered amount of ${getEnteredAmount()}. Would you like to proceed with the current amount or cancel?`;

      // Show dialog and handle user response
      this.util.dialog(
        "Attention",
        dialogMessage,
        ApplicationData.dialogType._CASH_DEPOSIT,
        ApplicationData.dialogIcon._WARNING,
        (result: boolean) => {
          if (result) {
            this.buttonStateDisabled = true;

            // Add collected amount to deposited cash if available
            if (ApplicationData.customer.collectedAmount > 0) {
              this.depositedCash += ApplicationData.customer.collectedAmount;
              sessionStorage.setItem("currentAmount", this.depositedCash.toString());
            }

            // Proceed with transaction if pending or collected amount exists
            if (this.transactionPending || ApplicationData.customer.collectedAmount > 0) {
              this.completingCall = true;
              this.performTransaction();
            } else {
              // Optionally navigate to transaction result page (commented out)
              // this._router.navigate(['transaction-result']);
            }
          }
        }
      );
    } else {
      // Perform transaction if deposited cash matches the entered amount
      this.performTransaction();
    }
  }
}

performTransaction() {
  this.util.takePicture("Perform Cash Transaction");
  this.initService.stopMonitoring();
  speak(this.componentLabeling.text_to_speech.processingTransaction);
  // this.dataService.subject.next("Performing Transaction");
  //    this.spinner = this.spinnerService.start(WebResponseService.messages.msg_loading_start_cash_transaction.message);
  this.util.spinnerStart(WebResponseService.messages.msg_loading_start_cash_transaction.message);


  this.apiResponse.getTWARE_NETWORK_STATUS().subscribe(async (networkResponse: any) => {

    if (networkResponse["code"] == "0000") {
      ApplicationData.perefernces.transactionPerformed = true;
      this.apiResponse.performCashTransaction().subscribe(async (transactionResponse: any) => {
        console.log('Transaction Response:', transactionResponse);
        if (ApplicationData.sessionTransaction.isCashStuck) {
          transactionResponse["statusCode"] = "99";
          if (transactionResponse["data"]) {
            transactionResponse["data"]["transactionStatus"] = "Suspect";
          }
        }
        setTransactionStatusCode(transactionResponse["statusCode"]);
        localStorage.setItem("refreshed", "transactioninprocess");
        this.util.spinnerStop();

        setTransactionStatus(transactionResponse["data"]["transactionStatus"]);
        //this.dataService.subject.next("Transaction Status: " + getTransactionStatus());
        ApplicationData.perefernces.batchCapacity = transactionResponse["data"]["batchCapacity"];

        if (transactionResponse["statusCode"] == "00") {
          this.dataService.subject.next("Transaction Success");
          setTransactionStatus("Success");

          //   this.apiResponse.updateTransactionStatus("Success", []).subscribe((statusResponse: any) => { });

          setTransactionResponseBehavior(true, true, false, "thankyou", "");
          this.handleTransactionResponse(transactionResponse);

        }
        else if (transactionResponse["statusCode"] == "02" || transactionResponse["statusCode"] == "99") {
          this.dataService.subject.next("Transaction Error");

          setTransactionStatus("Suspect");
          //     this.dataService.subject.next("Transaction Suspected");
          setTransactionResponseBehavior(true, true, false, "thankyou", "");
          this.handleTransactionResponse(transactionResponse);
          
        }
        else if (transactionResponse["statusCode"] == "03") {
          this.dataService.subject.next("Transaction failed");

          setTransactionStatus("failed");
          //     this.dataService.subject.next("Transaction Suspected");
          setTransactionResponseBehavior(false, false, true, "thankyou", "");
          this.handleTransactionResponse(transactionResponse);
         
        }
        else {
          if (transactionResponse["statusCode"] == "06") {
            this.dataService.subject.next("Bag Capacity Reached");

          }
          this.dataService.subject.next("Transaction Error");

          setTransactionResponseBehavior(false, false, true, "thankyou", transactionResponse['responseMessage']);
          this.handleTransactionResponse(transactionResponse);

        }
        

      }, err => {
        this.dataService.subject.next("Transaction Error");
        this.util.spinnerStop();
        setTransactionResponseBehavior(true, true, false, "thankyou", "");
        this.apiResponse.updateTransactionStatus("Suspect", []).subscribe((statusResponse: any) => {
          setTransactionStatus("Suspect");
          this.apiResponse.TWARE_endTransaction().subscribe(async (endTransactionResponse: any) => {
            //       this.dataService.subject.next("TRANSACTION ENDED");
            if (endTransactionResponse["statusCode"] == "00") {
              // this.dataService.subject.next("Cash Dropped to Bag");
              sessionStorage.removeItem("TWARE_transactionId");
            }
          });
        }, err => {
          setTransactionStatus("Suspect");

        });
      });
    } else {
      this.util.spinnerStop();
      //   console.log(sessionStorage.getItem("currentAmount"));
      this.errorDialog(WebResponseService.messages.msg_err_proc_req.heading, WebResponseService.messages.msg_err_proc_req.message, (res1) => {
        setTransactionResponseBehavior(false, false, true, "thankyou", "");
        this.dataService.pushCancelTransaction("Failed");
        // this.openShutter(res2 => {
        //   this.transactionError("thankyou");
        // });
      });
    }

  }, err => {
    this.util.spinnerStop();
    this.errorDialog(WebResponseService.messages.msg_err_proc_req.heading, WebResponseService.messages.msg_err_proc_req.message, (res1) => {
      setTransactionResponseBehavior(false, false, true, "thankyou", "");
      this.dataService.pushCancelTransaction("Failed");
      // this.openShutter(res2 => {
      //   this.transactionError("thankyou");
      // });
    })
  });
}

handleTransactionResponse(transactionResponse) {
  setTransactionNumber(transactionResponse["data"]["transactionNumber"]);
  let stackDetail = [];
  if (transactionResponse["statusCode"] != "00" && transactionResponse["statusCode"] != "99" && transactionResponse["statusCode"] != "02") {
    setTransactionStatus("Failed");
    this.componentResult.emit({ step: true, value: "Transaction Failed" });
    return;
  }
  // if (transactionResponse["statusCode"] != "00" && transactionResponse["statusCode"] != "99" && transactionResponse["statusCode"] != "02") {
  //   this.apiResponse.updateTransactionStatus("Failed", stackDetail).subscribe((statusResponse: any) => {
  //     setTransactionStatus(statusResponse['data']['transactionStatus']);

  //     this.apiResponse.TWARE_endTransaction().subscribe(async (endTransactionResponse: any) => {
  //       //    this.dataService.subject.next("TRANSACTION ENDED");
  //       if (endTransactionResponse["statusCode"] == "00") {
  //         // this.dataService.subject.next("Cash Dropped to Bag");
  //         sessionStorage.removeItem("TWARE_transactionId");
  //       }
  //     });


  //   }, err => {
  //     setTransactionStatus("Suspect");
  //     this.dataService.subject.next("Transaction Suspected");
  //   });

  //   this.componentResult.emit({ step: true, value: "Transaction Failed" });
  //   return;
  // }

  this.transactionPending = false;
  this.util.spinnerStart("");

  let denom = JSON.parse(String(sessionStorage.getItem("currentDenom")));
  const walletAmount = ApplicationData.customer.collectedAmount;

  if ((denom && walletAmount) || (denom && !walletAmount)) {
      // Default flow including acceptorStack call
      this.apiResponse.acceptorStack().subscribe(async (stackResponse: any) => {
          consoleLog("transaction-review.component.ts", "Requested Drop Cash", stackResponse);

          if (stackResponse["code"] == "0000" || stackResponse["code"] == "CSH_ACP_0000") {
              this.dataService.subject.next("STACK STATUS SUCCESS");
              let stackDetail = [];
              if (stackResponse['data']) {
                  stackDetail = stackResponse['data'];
              }

              this.apiResponse.updateTransactionStatus("Success", stackDetail).subscribe((statusResponse: any) => {
                  // setTransactionStatus(statusResponse['data']['transactionStatus']);

                  this.apiResponse.TWARE_endTransaction().subscribe((endTransactionResponse: any) => {
                      if (endTransactionResponse["statusCode"] == "00") {
                          sessionStorage.removeItem("TWARE_transactionId");
                      }
                  });

              }, err => {
                  setTransactionStatus("Suspect");
                  this.dataService.subject.next("Transaction Suspected");
              });

              sessionStorage.setItem("pendingDrop", "false");
              ApplicationData.sessionTransaction.denominationsStacked = true;

          } else {
              sessionStorage.setItem("pendingDrop", "true");
              this.dataService.subject.next("STACK STATUS PENDING");
          }

          this.componentResult.emit({ step: true, value: "Transaction Completed" });
          this.util.spinnerStop();
      }, (error: any) => {
          this.handleErrorFlow(error);
      });

  } else if (walletAmount && !denom) {
      consoleLog("transaction-review.component.ts", "Skipping acceptor stack due to no denom");

      this.apiResponse.updateTransactionStatus("Success", []).subscribe((statusResponse: any) => {
          // setTransactionStatus(statusResponse['data']['transactionStatus']);

          this.apiResponse.TWARE_endTransaction().subscribe((endTransactionResponse: any) => {
              if (endTransactionResponse["statusCode"] == "00") {
                  sessionStorage.removeItem("TWARE_transactionId");
              }
          });

      }, err => {
          setTransactionStatus("Suspect");
          this.dataService.subject.next("Transaction Suspected");
      });

      sessionStorage.setItem("pendingDrop", "false");
      ApplicationData.sessionTransaction.denominationsStacked = true;

      this.componentResult.emit({ step: true, value: "Transaction Completed" });
      this.util.spinnerStop();

  } else {
      consoleLog("transaction-review.component.ts", "No denom and no wallet amount - handle this case");
  }
}

handleErrorFlow(error: any) {
    this.dataService.subject.next("STACK STATUS ERROR");
    this.apiResponse.updateCashAcceptorHealth(error["errors"]["errorCode"], error["errors"]["errorMessage"]);
    this.dataService.subject.next("Pushing Device Health Errors");

    if (this.completingCall) {
        ApplicationData.sessionTransaction.responseBehavior.isSuccess;
        sessionStorage.setItem("pendingDrop", "true");
        this.componentResult.emit();
    } else {
        this.cannotAddMoreCash = true;
        this.dataService.subject.next("Escrow is Full");
        this.errorDialog(WebResponseService.messages.err_accept_cash.heading, WebResponseService.messages.err_accept_cash.message, res => {});
    }

    this.util.spinnerStop();
}


  errorDialog(title: string, message: string, callback: Function): void {
    this.util.dialog(message, "", ApplicationData.dialogType._MESSAGE, ApplicationData.dialogIcon._ERROR, result => {
      callback(result);
    });
  }

  proceed() {
    if (this.depositedCash > 0 || ApplicationData.customer.collectedAmount > 0) {
        this.completeTransaction();
    } else {
        this.cashAcceptor.startDepositFlow();
    }
  }

}



