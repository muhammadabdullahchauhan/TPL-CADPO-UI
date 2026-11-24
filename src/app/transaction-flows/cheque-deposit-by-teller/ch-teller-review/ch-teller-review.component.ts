import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { AppComponent } from 'src/app/app.component';
import { DataService } from 'src/app/classes/DataService';
import { consoleLog, getAccountNumber, getAccountTitle, getDepositMethod, getEnteredAmount, getMobileNumber, getTransactionPurposeId, getTransactionStatus, setTransactionNumber, setTransactionResponseBehavior, setTransactionStatus, setTransactionStatusCode } from 'src/app/classes/GlobalFunctions';
import { Initializer, speak } from 'src/app/classes/Initializer';
import { ApplicationData } from 'src/app/classes/application';
import { ChequeAcceptorComponent } from 'src/app/transaction components/cheque-acceptor/cheque-acceptor.component';

import { WebResponseService } from 'src/app/web-response.service';

@Component({
  selector: 'app-ch-teller-review',
  templateUrl: './ch-teller-review.component.html',
  styleUrls: ['./ch-teller-review.component.css']
})
export class ChTellerReviewComponent {
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
  chequeDetails: any;
  collectedCash: number;
  totalRejected: number;
  form_direction: any;
  isChequeParsed: boolean = false;
  parsedChequeData: any = null;

  @ViewChild(ChequeAcceptorComponent) chequeAcceptor: ChequeAcceptorComponent;

  @Output() componentResult = new EventEmitter<any>();


  constructor(
    private util: AppComponent, 
    private apiResponse: WebResponseService, 
    private dataService: DataService, 
    private initService: Initializer) {

    this.accountTitle = getAccountTitle();
    this.accountNum = getAccountNumber();
    this.mobileNum = getMobileNumber();
    this.amount = getEnteredAmount();
    this.purpose = getTransactionPurposeId();
    this.collectedCash = 0;
    this.totalRejected = 0;
    this.isChequeParsed = ApplicationData.sessionTransaction.isChequeParsed || false;
    this.parsedChequeData = ApplicationData.sessionTransaction.parsedChequeData || null;

    this.componentLabeling = ApplicationData.labeling.transaction_review;
    this.form_direction = ApplicationData.labeling.localization.settings.direction;
    speak(this.componentLabeling.text_to_speech.onload);
    this.initService.startMonitoring();

  }

  chequeAccepted(chequeResponse: any) {
    this.chequeDetails = chequeResponse;
    this.isChequeParsed = ApplicationData.sessionTransaction.isChequeParsed || false;
    this.parsedChequeData = ApplicationData.sessionTransaction.parsedChequeData || null;

    this.responsePending = false;
    this.transactionPending = true;
  }

  takePicture() {
    this.util.takePicture("Cheque Accept");
  }

  performTransaction() {
    this.util.takePicture("Perform Cheque Transaction");
    this.initService.stopMonitoring();
    speak(this.componentLabeling.text_to_speech.processingTransaction);
    this.util.spinnerStart(WebResponseService.messages.msg_loading_start_cash_transaction.message);

    this.apiResponse.getTWARE_NETWORK_STATUS().subscribe(async (networkResponse: any) => {
        if (networkResponse["code"] == "0000") {
            ApplicationData.perefernces.transactionPerformed = true;
            this.apiResponse.VerifyChequeTransaction(this.chequeDetails).subscribe(async (transactionResponse: any) => {
                console.log('Transaction Response:', transactionResponse);
                setTransactionStatusCode(transactionResponse["statusCode"]);
                localStorage.setItem("refreshed", "transactioninprocess");
                this.util.spinnerStop();

                setTransactionStatus(transactionResponse["data"]["transactionStatus"]);
                // ApplicationData.perefernces.batchCapacity = transactionResponse["data"]["batchCapacity"];

                if (transactionResponse["statusCode"] == "00") {
                    this.dataService.subject.next("Transaction Success");
                    // setTransactionStatus("Success");
                    setTransactionStatus(transactionResponse["data"]["transactionStatus"]);
                    console.log("Status 00 Code " + getTransactionStatus());
                    setTransactionResponseBehavior(true, true, false, "thankyou", "");
                    this.handleTransactionResponse(transactionResponse);
                } else if (transactionResponse["statusCode"] == "02" || transactionResponse["statusCode"] == "99") {
                    this.dataService.subject.next("Transaction Error");

                    setTransactionStatus("Suspect");
                    setTransactionResponseBehavior(true, true, false, "thankyou", "");
                    this.handleTransactionResponse(transactionResponse);
                } else {
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
            this.errorDialog(WebResponseService.messages.msg_err_proc_req.heading, WebResponseService.messages.msg_err_proc_req.message, (res1) => {
                setTransactionResponseBehavior(false, false, true, "thankyou", "");
                this.dataService.pushCancelTransaction("Failed");
            });
        }
    }, err => {
        this.util.spinnerStop();
        this.errorDialog(WebResponseService.messages.msg_err_proc_req.heading, WebResponseService.messages.msg_err_proc_req.message, (res1) => {
            setTransactionResponseBehavior(false, false, true, "thankyou", "");
            this.dataService.pushCancelTransaction("Failed");
        });
    });
}

handleTransactionResponse(transactionResponse) {
    setTransactionNumber(transactionResponse["data"]["transactionNumber"]);

    this.transactionPending = false;
    this.util.spinnerStart("");

    this.apiResponse.chequeEndorse().subscribe(
        (endorseResponse: any) => {
            // this.dataService.subject.next("CHEQUE ENDORSE CALLED");
            this.chequeDeposit(transactionResponse);
        },
        (err) => {
            // this.dataService.subject.next("CHEQUE ENDORSE CALLED");
            this.chequeDeposit(transactionResponse);
        },
        () => {
            // This ensures the response has been received (either success or error).
            // this.dataService.subject.next("CHEQUE ENDORSED");
        }
    );
}


chequeDeposit(transactionResponse) {
    setTransactionNumber(transactionResponse["data"]["transactionNumber"]);
    if (
        transactionResponse["statusCode"] != "00" &&
        transactionResponse["statusCode"] != "99" &&
        transactionResponse["statusCode"] != "02"
    ) {
        this.componentResult.emit({ step: true, value: "Transaction Failed" });
        return;
    }

    this.transactionPending = false;
    this.util.spinnerStart("");
    this.apiResponse.chequeDeposit().subscribe(
      async (stackResponse: any) => {
        console.log("transaction-review.component.ts", "Requested Drop Cash", stackResponse);

        const isStackSuccess = stackResponse["code"] === "0000" || stackResponse["code"] === "CHQ_ACP_0000";
        const stackStatus = isStackSuccess ? "Success" : "Failed";
        const transactionStatus = getTransactionStatus(); // Approve / Reject / Authorize

        // Set final status according to table
        let finalStatus = "";
        if (transactionStatus === "Approve") {
          finalStatus = isStackSuccess ? "Success" : "Suspect";
        } else if (transactionStatus === "Reject") {
          finalStatus = isStackSuccess ? "Failed" : "Suspect";
        } else if (transactionStatus === "Authorize") {
          finalStatus = "Authorize";
        } else if (transactionStatus === "Pending") {
          finalStatus = isStackSuccess ? "Authorize" : "Suspect";
        }

        setTransactionStatus(finalStatus);

        if (stackStatus) {
          this.dataService.subject.next("STACK STATUS SUCCESS");

          this.apiResponse.updateTransactionStatusTeller(stackStatus, []).subscribe(
            (statusResponse: any) => {
              // setTransactionStatus(statusResponse["data"]["transactionStatus"]); <-- already set above
              this.apiResponse.TWARE_endTransaction().subscribe(async (endTransactionResponse: any) => {
                if (endTransactionResponse["statusCode"] === "00") {
                  sessionStorage.removeItem("TWARE_transactionId");
                }
              });
            },
            (err) => {
              setTransactionStatus("Suspect");
              this.dataService.subject.next("Transaction Suspected");
            }
          );

          sessionStorage.setItem("pendingDrop", "false");
          ApplicationData.sessionTransaction.denominationsStacked = true;
        } else {
          sessionStorage.setItem("pendingDrop", "true");
          this.dataService.subject.next("STACK STATUS PENDING");
        }

        this.componentResult.emit({ step: true, value: "Transaction Completed" });
        this.util.spinnerStop();
      },
      (error: any) => {
        this.dataService.subject.next("STACK STATUS ERROR");

        if (this.completingCall === true) {
          ApplicationData.sessionTransaction.responseBehavior.isSuccess;
          sessionStorage.setItem("pendingDrop", "true");
          this.componentResult.emit();
        } else {
          this.cannotAddMoreCash = true;
          this.dataService.subject.next("Escrow is Full");
          this.errorDialog(
            WebResponseService.messages.err_accept_cash.heading,
            WebResponseService.messages.err_accept_cash.message,
            (res) => {}
          );
        }

        this.util.spinnerStop();
      }
    );


    // this.apiResponse.chequeDeposit().subscribe(
    //     async (stackResponse: any) => {
    //         console.log("transaction-review.component.ts", "Requested Drop Cash", stackResponse);

    //         if (stackResponse["code"] == "0000" || stackResponse["code"] == "CHQ_ACP_0000") {
    //             this.dataService.subject.next("STACK STATUS SUCCESS");
    //             // let stackDetail = [];
    //             // if (stackResponse['data'] != undefined && stackResponse['data'] != null && stackResponse['data'] != "") {
    //             //     stackDetail = stackResponse['data'];
    //             // }
    //             this.apiResponse.updateTransactionStatus("Success", []).subscribe(
    //                 (statusResponse: any) => {
    //                     setTransactionStatus(statusResponse["data"]["transactionStatus"]);

    //                     this.apiResponse.TWARE_endTransaction().subscribe(async (endTransactionResponse: any) => {
    //                         if (endTransactionResponse["statusCode"] == "00") {
    //                             sessionStorage.removeItem("TWARE_transactionId");
    //                         }
    //                     });
    //                 },
    //                 (err) => {
    //                     setTransactionStatus("Suspect");
    //                     this.dataService.subject.next("Transaction Suspected");
    //                 }
    //             );

    //             sessionStorage.setItem("pendingDrop", "false");
    //             ApplicationData.sessionTransaction.denominationsStacked = true;
    //         } else {
    //             sessionStorage.setItem("pendingDrop", "true");
    //             this.dataService.subject.next("STACK STATUS PENDING");
    //         }
    //         this.componentResult.emit({ step: true, value: "Transaction Completed" });
    //         this.util.spinnerStop();
    //     },
    //     (error: any) => {
    //         this.dataService.subject.next("STACK STATUS ERROR");
    //         if (this.completingCall == true) {
    //             ApplicationData.sessionTransaction.responseBehavior.isSuccess;
    //             sessionStorage.setItem("pendingDrop", "true");
    //             this.componentResult.emit();
    //         } else {
    //             this.cannotAddMoreCash = true;
    //             this.dataService.subject.next("Escrow is Full");
    //             this.errorDialog(
    //                 WebResponseService.messages.err_accept_cash.heading,
    //                 WebResponseService.messages.err_accept_cash.message,
    //                 (res) => {}
    //             );
    //         }
    //         this.util.spinnerStop();
    //     }
    // );
}

  errorDialog(title: string, message: string, callback: Function): void {
    this.util.dialog(message, "", ApplicationData.dialogType._MESSAGE, ApplicationData.dialogIcon._ERROR, result => {
      callback(result);
    });
  }

  proceed() {
    if (this.chequeDetails) {
      this.performTransaction();
    }
    else {
      this.chequeAcceptor.startDepositFlow();
    }

  }

































  
}



