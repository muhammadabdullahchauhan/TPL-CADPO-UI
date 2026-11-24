import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { AppComponent } from 'src/app/app.component';
import { DataService } from 'src/app/classes/DataService';
import { consoleLog, getAccountNumber, getAccountTitle, getDepositMethod, getEnteredAmount, getMobileNumber, getTransactionPurposeId, setTransactionNumber, setTransactionResponseBehavior, setTransactionStatus, setTransactionStatusCode } from 'src/app/classes/GlobalFunctions';
import { Initializer, speak } from 'src/app/classes/Initializer';
import { ApplicationData } from 'src/app/classes/application';
import { CashAcceptorComponent } from 'src/app/transaction components/cash-acceptor/cash-acceptor.component';
import { WebResponseService } from 'src/app/web-response.service';
import { getbillingCompanyCode, getbillingCompanyName } from 'src/app/classes/GlobalFunctions';

@Component({
  selector: 'app-mt-review',
  templateUrl: './mt-review.component.html',
  styleUrls: ['./mt-review.component.css']
})
export class MtReviewComponent {


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

  topupCompany: any = {
    companyCode: '',
    companyName: '',
  };

  collectedCash: number;
  totalRejected: number;
  form_direction: any;

  walletAmount: string = "";
  showWalletAmount: boolean = false;

  @ViewChild(CashAcceptorComponent) cashAcceptor: CashAcceptorComponent;

  @Output() componentResult = new EventEmitter<any>();


  constructor(private util: AppComponent, private apiResponse: WebResponseService, private dataService: DataService, private initService: Initializer) {
    this.mobileNum = getMobileNumber();
    this.amount = getEnteredAmount();
    this.collectedCash = 0;
    this.totalRejected = 0;

    this.topupCompany.companyCode = getbillingCompanyCode();
    this.topupCompany.companyName = getbillingCompanyName();

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

  public completeTransaction() {
    if (ApplicationData.sessionTransaction.isCashStuck) {
      this.buttonStateDisabled = true;
      this.completingCall = true;
      this.performTransaction();
      return;
    }

    if (getDepositMethod() == ApplicationData.depositMethods._CASH_VAS_MOBILE_TOPUP) {


      if (this.depositedCash != Number(this.amount)) {
        let concatMessage = "";
        if (this.depositedCash < Number(this.amount)) {
          concatMessage = "less";
        }
        else if (this.depositedCash > Number(this.amount)) {
          concatMessage = "greater";
        }
        // Conditional dialog message based on collected amount
        let dialogMessage = ApplicationData.customer.collectedAmount > 0
        ? `The Topup amount is ${this.depositedCash} and the balance in your wallet is ${ApplicationData.customer.collectedAmount}. The sum of both is ${concatMessage} than the entered amount of ${getEnteredAmount()}. Would you like to proceed with the current amount or cancel?`
        : `The Topup amount of ${this.depositedCash} is ${concatMessage} than the entered amount of ${getEnteredAmount()}. Would you like to proceed with the current amount or cancel?`;

    this.util.dialog(
        "Attention", 
        dialogMessage,
        ApplicationData.dialogType._CASH_DEPOSIT, 
        ApplicationData.dialogIcon._WARNING, 
          result => {
            if (result) {
              this.buttonStateDisabled = true;
            
              if (ApplicationData.customer.collectedAmount > 0) {
                this.depositedCash = this.depositedCash + ApplicationData.customer.collectedAmount;
                sessionStorage.setItem("currentAmount", this.depositedCash.toString());
              }
            
              if (this.transactionPending || ApplicationData.customer.collectedAmount > 0) {
                this.completingCall = true;
                this.performTransaction();
              } else {
                // Navigate to the transaction result page later if needed
                // this._router.navigate(['transaction-result']);
              }
            }
            
        });
      }


      else {
        this.performTransaction();
      }

    }

  }

  performTransaction() {
    this.util.takePicture("Perform Mobile TopUp Transaction");
    this.initService.stopMonitoring();
    speak(this.componentLabeling.text_to_speech.processingTransaction);
  
    this.util.spinnerStart(WebResponseService.messages.msg_loading_start_cash_transaction.message);
  
    this.apiResponse.getTWARE_NETWORK_STATUS().subscribe(async (networkResponse: any) => {
  
      if (networkResponse["code"] == "0000") {
        ApplicationData.perefernces.transactionPerformed = true;
        this.dataService.subject.next("Performing Topup Transaction");
  
        this.apiResponse.MobileTopupSubTransaction().subscribe(async (transactionResponse: any) => {
          console.log('Transaction Response:', transactionResponse);
          if (ApplicationData.sessionTransaction.isCashStuck) {
            transactionResponse["statusCode"] = "99";
            if (transactionResponse["data"]) {
              transactionResponse["data"]["transactionStatus"] = "Suspect";
            }
          }
          setTransactionStatus(transactionResponse["data"]["transactionStatus"]);
          ApplicationData.perefernces.batchCapacity = transactionResponse["data"]["batchCapacity"];
          setTransactionStatusCode(transactionResponse["statusCode"]);
  
          if (transactionResponse["statusCode"] == "00") {
            this.dataService.subject.next("Transaction Success");
            setTransactionStatus("Success");
            setTransactionResponseBehavior(true, true, false, "thankyou", "");
          }
          else if (transactionResponse["statusCode"] == "02" || transactionResponse["statusCode"] == "99") {
            this.dataService.subject.next("Transaction Error");
            setTransactionResponseBehavior(true, true, false, "thankyou", "");
          }
          else {
            if (transactionResponse["statusCode"] == "06") {
              this.dataService.subject.next("Bag Capacity Reached");
            }
            this.dataService.subject.next("Transaction Error");
            setTransactionResponseBehavior(false, false, true, "thankyou", transactionResponse['responseMessage']);
          }
  
          this.handleTransactionResponse(transactionResponse);
  
        }, err => {
          this.dataService.subject.next("Transaction Error");
          this.util.spinnerStop();
          setTransactionResponseBehavior(true, true, false, "thankyou", "");
          this.apiResponse.updateTransactionStatus("Suspect", []).subscribe((statusResponse: any) => {
            setTransactionStatus("Suspect");
            this.apiResponse.TWARE_endTransaction().subscribe(async (endTransactionResponse: any) => {
              if (endTransactionResponse["statusCode"] == "00") {
                sessionStorage.removeItem("TWARE_transactionId");
              }
            });
          }, err => {
            setTransactionStatus("Suspect");
          });
        });
  
      } else {
        this.util.spinnerStop();
        this.errorDialog(
          WebResponseService.messages.msg_err_proc_req.heading,
          WebResponseService.messages.msg_err_proc_req.message,
          (res1) => {
            setTransactionResponseBehavior(false, false, true, "thankyou", "");
            this.dataService.pushCancelTransaction("Failed");
          }
        );
      }
  
    }, err => {
      this.util.spinnerStop();
      this.errorDialog(
        WebResponseService.messages.msg_err_proc_req.heading,
        WebResponseService.messages.msg_err_proc_req.message,
        (res1) => {
          setTransactionResponseBehavior(false, false, true, "thankyou", "");
          this.dataService.pushCancelTransaction("Failed");
        }
      );
    });
  }
  

  handleTransactionResponse(transactionResponse) {

    setTransactionNumber(transactionResponse["data"]["transactionNumber"]);
    if (transactionResponse["statusCode"] != "00" && transactionResponse["statusCode"] != "99" && transactionResponse["statusCode"] != "02") {
      this.componentResult.emit({ step: true, value: "Transaction Failed" });
      return;
    }

    this.transactionPending = false;
    //    this.dataService.subject.next("Dropping Cash");
    this.util.spinnerStart("");

    this.apiResponse.acceptorStack().subscribe(async (stackResponse: any) => {

      consoleLog("transaction-review.component.ts", "Requested Drop Cash", stackResponse);


      if (stackResponse["code"] == "0000" || stackResponse["code"] == "CSH_ACP_0000") {
        this.dataService.subject.next("STACK STATUS SUCCESS");
        let stackDetail = [];
        if (stackResponse['data'] != undefined && stackResponse['data'] != null && stackResponse['data'] != "") {
          stackDetail = stackResponse['data'];
        }
        this.apiResponse.updateTransactionStatus("Success", stackDetail).subscribe((statusResponse: any) => {
          setTransactionStatus(statusResponse['data']['transactionStatus']);

          this.apiResponse.TWARE_endTransaction().subscribe(async (endTransactionResponse: any) => {
            //    this.dataService.subject.next("TRANSACTION ENDED");
            if (endTransactionResponse["statusCode"] == "00") {
              // this.dataService.subject.next("Cash Dropped to Bag");
              sessionStorage.removeItem("TWARE_transactionId");
            }
          });


        }, err => {
          setTransactionStatus("Suspect");
          this.dataService.subject.next("Transaction Suspected");
        });


        sessionStorage.setItem("pendingDrop", "false");
        ApplicationData.sessionTransaction.denominationsStacked = true;


      }
      else {
        sessionStorage.setItem("pendingDrop", "true");
        this.dataService.subject.next("STACK STATUS PENDING");

      }
      this.componentResult.emit({ step: true, value: "Transaction Completed" });
      // this._router.navigate(['transaction-result']);

      //  this.spinnerService.stop(this.spinner);
      this.util.spinnerStop();
    }, (error: any) => {
      this.dataService.subject.next("STACK STATUS ERROR");
      this.apiResponse.updateCashAcceptorHealth(error["errors"]["errorCode"], error["errors"]["errorMessage"]);
      this.dataService.subject.next("Pushing Device Health Errors");
      if (this.completingCall == true) {
        ApplicationData.sessionTransaction.responseBehavior.isSuccess;
        sessionStorage.setItem("pendingDrop", "true");
        this.componentResult.emit();
        // this._router.navigate(['transaction-result']);
      }
      else {
        this.cannotAddMoreCash = true;
        this.dataService.subject.next("Escrow is Full");
        this.errorDialog(WebResponseService.messages.err_accept_cash.heading, WebResponseService.messages.err_accept_cash.message, res => { });
      }
      //   this.spinnerService.stop(this.spinner);
      this.util.spinnerStop();
    }
    );
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








  



  // performTransaction() {
  //   this.takePicture();
  //   this.initService.stopMonitoring();
  //   speak(this.componentLabeling.text_to_speech.processingTransaction);
    
  //   this.util.spinnerStart(WebResponseService.messages.msg_loading_start_cash_transaction.message);


  //   this.apiResponse.getTWARE_NETWORK_STATUS().subscribe(async (networkResponse: any) => {

  //     if (networkResponse["code"] == "0000") {
  //       ApplicationData.perefernces.transactionPerformed = true;

  //       this.dataService.subject.next("Performing Topup Transaction");
  //         this.apiResponse.MobileTopupSubTransaction().subscribe(async (transactionResponse: any) => {


  //           setTransactionStatus(transactionResponse["data"]["transactionStatus"]);

  //           ApplicationData.perefernces.batchCapacity = transactionResponse["data"]["batchCapacity"];
  //           if (transactionResponse["statusCode"] == "00") {
  //             setTransactionResponseBehavior(true, true, false, "home", "");
  //             this.handleTransactionResponse(transactionResponse);

  //           }
  //           else if (transactionResponse["statusCode"] == "02" || transactionResponse["statusCode"] == "99") {
  //             setTransactionResponseBehavior(false, true, false, "home", "");
  //             this.dataService.subject.next("Bill Transaction Error");
              
  //           }
  //           else {
  //             if (transactionResponse["statusCode"] == "06") {
  //               this.dataService.subject.next("Bag Capacity Reached");
  //             }
  //             this.errorDialog("Error", transactionResponse['responseMessage'], (res1) => {
  //               this.dataService.subject.next("Bill Transaction Error");
  //               setTransactionResponseBehavior(false, false, true, "home", "");
  //               this.handleTransactionResponse(transactionResponse);
                
  //             })
  //           }

  //         }, err => {
  //           this.dataService.subject.next("Bill Transaction Error");
          
  //         });





          

  //       this.apiResponse.performCashTransaction().subscribe(async (transactionResponse: any) => {
  //         setTransactionStatusCode(transactionResponse["statusCode"]);
  //         localStorage.setItem("refreshed", "transactioninprocess");
  //         this.util.spinnerStop();

  //         setTransactionStatus(transactionResponse["data"]["transactionStatus"]);
  //         //this.dataService.subject.next("Transaction Status: " + getTransactionStatus());
  //         ApplicationData.perefernces.batchCapacity = transactionResponse["data"]["batchCapacity"];

  //         if (transactionResponse["statusCode"] == "00") {
  //           this.dataService.subject.next("Transaction Success");

  //           //   this.apiResponse.updateTransactionStatus("Success", []).subscribe((statusResponse: any) => { });

  //           setTransactionResponseBehavior(true, true, false, "thankyou", "");
  //           this.handleTransactionResponse(transactionResponse);

  //         }
  //         else if (transactionResponse["statusCode"] == "02" || transactionResponse["statusCode"] == "99") {
  //           this.dataService.subject.next("Transaction Error");

  //           setTransactionStatus("Suspect");
   
  //           setTransactionResponseBehavior(true, true, false, "thankyou", "");
  //           this.handleTransactionResponse(transactionResponse);
            
  //         }
  //         else {
  //           if (transactionResponse["statusCode"] == "06") {
  //             this.dataService.subject.next("Bag Capacity Reached");

  //           }
  //           this.dataService.subject.next("Transaction Error");

  //           setTransactionResponseBehavior(false, false, true, "thankyou", transactionResponse['responseMessage']);
  //           this.handleTransactionResponse(transactionResponse);

  //         }

  //       }, err => {
  //         this.dataService.subject.next("Transaction Error");
  //         this.util.spinnerStop();
  //         setTransactionResponseBehavior(true, true, false, "thankyou", "");
  //         this.apiResponse.updateTransactionStatus("Suspect", []).subscribe((statusResponse: any) => {
  //           setTransactionStatus("Suspect");
  //           this.apiResponse.TWARE_endTransaction().subscribe(async (endTransactionResponse: any) => {

  //             if (endTransactionResponse["statusCode"] == "00") {
                
  //               sessionStorage.removeItem("TWARE_transactionId");
  //             }
  //           });
  //         }, err => {
  //           setTransactionStatus("Suspect");

  //         });
  //       });
  //     } else {
  //       this.util.spinnerStop();

  //       this.errorDialog(WebResponseService.messages.msg_err_proc_req.heading, WebResponseService.messages.msg_err_proc_req.message, (res1) => {
  //         setTransactionResponseBehavior(false, false, true, "thankyou", "");
  //         this.dataService.pushCancelTransaction("Failed");
          
  //       });
  //     }

  //   }, err => {
  //     this.util.spinnerStop();
  //     this.errorDialog(WebResponseService.messages.msg_err_proc_req.heading, WebResponseService.messages.msg_err_proc_req.message, (res1) => {
  //       setTransactionResponseBehavior(false, false, true, "thankyou", "");
  //       this.dataService.pushCancelTransaction("Failed");
        
  //     })
  //   });
  // }



}



