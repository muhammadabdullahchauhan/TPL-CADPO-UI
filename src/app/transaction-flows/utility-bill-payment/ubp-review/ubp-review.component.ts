import {
  Component,
  EventEmitter,
  Output,
  ViewChild,
  AfterViewInit,
  ElementRef,
  Renderer2,
} from "@angular/core";
import { AppComponent } from "src/app/app.component";
import { DataService } from "src/app/classes/DataService";
import {
  consoleLog,
  getAccountNumber,
  getTransactionData,
  getAccountTitle,
  getDepositMethod,
  getEnteredAmount,
  getMobileNumber,
  getTransactionPurposeId,
  setTransactionNumber,
  setTransactionResponseBehavior,
  setTransactionStatus,
  setTransactionStatusCode,
  setEnteredAmount,
} from "src/app/classes/GlobalFunctions";
import { Initializer, speak } from "src/app/classes/Initializer";
import { ApplicationData } from "src/app/classes/application";
import { CashAcceptorComponent } from "src/app/transaction components/cash-acceptor/cash-acceptor.component";
import { WebResponseService } from "src/app/web-response.service";
import {
  getbillingCompanyCode,
  getbillingCompanyName,
} from "src/app/classes/GlobalFunctions";

@Component({
  selector: "app-ubp-review",
  templateUrl: "./ubp-review.component.html",
  styleUrls: ["./ubp-review.component.css"],
})
export class UbpReviewComponent implements AfterViewInit {
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

  billDetail: any;

  billingCompany: any = {
    companyCode: "",
    companyName: "",
  };
  walletAmount: number = 0;
  @ViewChild(CashAcceptorComponent) cashAcceptor: CashAcceptorComponent;
  @ViewChild("amountField") amountField: ElementRef;

  @Output() componentResult = new EventEmitter<any>();

  constructor(
    private util: AppComponent,
    private apiResponse: WebResponseService,
    private dataService: DataService,
    private initService: Initializer,
    private renderer: Renderer2,
  ) {
    this.accountTitle = getAccountTitle();
    this.accountNum = getAccountNumber();
    this.mobileNum = getMobileNumber();
    this.billDetail = getTransactionData();

    // Set and highlight the amount
    setEnteredAmount(this.billDetail.amount);
    // this.amount = this.billDetail.amount;

    this.billingCompany.companyCode = getbillingCompanyCode();
    this.billingCompany.companyName = getbillingCompanyName();
    this.collectedCash = 0;
    this.totalRejected = 0;

    this.componentLabeling = ApplicationData.labeling.transaction_review;
    this.form_direction =
      ApplicationData.labeling.localization.settings.direction;
    speak(this.componentLabeling.text_to_speech.onload);
    this.initService.startMonitoring();
    if (ApplicationData.customer.collectedAmount > 0) {
      this.walletAmount = ApplicationData.customer.collectedAmount;
    }
  }

  ngAfterViewInit() {
    this.highlightAmountField();
  }

  highlightAmountField() {
    if (this.amountField) {
      this.renderer.setStyle(
        this.amountField.nativeElement,
        "border",
        "2px solid orange",
      );
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
    const amountValue = Number(this.billDetail.amount);
    const depositedCashValue = Number(this.depositedCash) || 0; // Convert to number, default to 0 if NaN
    const wallet = Number(this.walletAmount) || 0; // Convert to number, default to 0 if NaN

    const remaining = amountValue - (depositedCashValue + wallet);
    return Math.max(remaining, 0); // Ensure it does not show negative values
  }

  public completeTransaction() {
    console.log("Starting completeTransaction()");
    if (ApplicationData.sessionTransaction.isCashStuck) {
      this.buttonStateDisabled = true;
      this.completingCall = true;
      this.performTransaction();
      return;
    }

    if (
      getDepositMethod() == ApplicationData.depositMethods._CASH_BILL_PAYMENT
    ) {
      console.log("Deposit method is cash");

      if (this.depositedCash != Number(this.billDetail.amount)) {
        let concatMessage = "";
        if (this.depositedCash < Number(this.billDetail.amount)) {
          concatMessage = "less";
        } else if (this.depositedCash > Number(this.billDetail.amount)) {
          concatMessage = "greater";
        }
        console.log(
          `Mismatch between deposited amount (${this.depositedCash}) and entered amount (${getEnteredAmount()}), ${concatMessage}`,
        );

        // Conditional dialog message based on collected amount
        const dialogMessage =
          ApplicationData.customer.collectedAmount > 0
            ? `The Deposit amount is Rs.${this.depositedCash} and the balance in your wallet is Rs.${ApplicationData.customer.collectedAmount}. The sum of both is ${concatMessage} than the bill amount of Rs.${this.billDetail.amount}. Would you like to proceed with the current amount or cancel?`
            : `The deposited amount of Rs.${this.depositedCash} is ${concatMessage} than the bill amount of Rs.${this.billDetail.amount}. Would you like to proceed with the current amount or cancel?`;

        this.util.dialog(
          "Attention",
          dialogMessage,
          ApplicationData.dialogType._CASH_DEPOSIT,
          ApplicationData.dialogIcon._WARNING,
          (result) => {
            console.log("Dialog result:", result);
            if (result) {
              this.buttonStateDisabled = true;

              if (ApplicationData.customer.collectedAmount > 0) {
                this.depositedCash =
                  this.depositedCash + ApplicationData.customer.collectedAmount;
                sessionStorage.setItem(
                  "currentAmount",
                  this.depositedCash.toString(),
                );
              }

              if (
                this.transactionPending == true ||
                ApplicationData.customer.collectedAmount > 0
              ) {
                this.completingCall = true;
                console.log("Proceeding with performTransaction()");
                this.performTransaction();
              } else {
                console.log(
                  "Transaction pending or collected amount > 0 condition not met",
                );
                // // this._router.navigate(['transaction-result']);
              }
            }
          },
        );
      } else {
        console.log("Amounts match, proceeding with performTransaction()");
        this.performTransaction();
      }
    } else {
      console.log("Deposit method is not cash");
    }
  }

  performTransaction() {
    this.util.takePicture("Perform Bill Payment Transaction");
    this.initService.stopMonitoring();
    speak(this.componentLabeling.text_to_speech.processingTransaction);
    this.util.spinnerStart(
      WebResponseService.messages.msg_loading_start_cash_transaction.message,
    );

    this.apiResponse.getTWARE_NETWORK_STATUS().subscribe(
      async (networkResponse: any) => {
        if (networkResponse["code"] == "0000") {
          ApplicationData.perefernces.transactionPerformed = true;
          this.apiResponse.performBillTransaction().subscribe(
            async (transactionResponse: any) => {
              console.log("Transaction Response:", transactionResponse);
              if (ApplicationData.sessionTransaction.isCashStuck) {
                transactionResponse["statusCode"] = "99";
                if (transactionResponse["data"]) {
                  transactionResponse["data"]["transactionStatus"] = "Suspect";
                }
              }
              setTransactionStatusCode(transactionResponse["statusCode"]);
              localStorage.setItem("refreshed", "transactioninprocess");
              //this.util.spinnerStop();

              setTransactionStatus(
                transactionResponse["data"]["transactionStatus"],
              );
              ApplicationData.perefernces.batchCapacity =
                transactionResponse["data"]["batchCapacity"];

              if (transactionResponse["statusCode"] == "00") {
                setTransactionStatus("Success");
                this.dataService.subject.next("Transaction Success");
                setTransactionResponseBehavior(
                  true,
                  true,
                  false,
                  "thankyou",
                  "",
                );
                this.handleTransactionResponse(transactionResponse);
              } else if (
                transactionResponse["statusCode"] == "02" ||
                transactionResponse["statusCode"] == "99"
              ) {
                this.dataService.subject.next("Transaction Error");
                setTransactionStatus("Suspect");
                setTransactionResponseBehavior(
                  true,
                  true,
                  false,
                  "thankyou",
                  "",
                );
                this.handleTransactionResponse(transactionResponse);
              } else {
                if (transactionResponse["statusCode"] == "06") {
                  this.dataService.subject.next("Bag Capacity Reached");
                }
                this.dataService.subject.next("Transaction Error");
                setTransactionResponseBehavior(
                  false,
                  false,
                  true,
                  "thankyou",
                  transactionResponse["responseMessage"],
                );
                this.handleTransactionResponse(transactionResponse);
              }
            },
            (err) => {
              this.dataService.subject.next("Transaction Error");
              this.util.spinnerStop();
              setTransactionResponseBehavior(true, true, false, "thankyou", "");
              this.apiResponse.updateTransactionStatus("Suspect", []).subscribe(
                (statusResponse: any) => {
                  setTransactionStatus("Suspect");
                  this.apiResponse
                    .TWARE_endTransaction()
                    .subscribe(async (endTransactionResponse: any) => {
                      if (endTransactionResponse["statusCode"] == "00") {
                        sessionStorage.removeItem("TWARE_transactionId");
                      }
                    });
                },
                (err) => {
                  setTransactionStatus("Suspect");
                },
              );
            },
          );
        } else {
          this.util.spinnerStop();
          this.errorDialog(
            WebResponseService.messages.msg_err_proc_req.heading,
            WebResponseService.messages.msg_err_proc_req.message,
            (res1) => {
              setTransactionResponseBehavior(
                false,
                false,
                true,
                "thankyou",
                "",
              );
              this.dataService.pushCancelTransaction("Failed");
            },
          );
        }
      },
      (err) => {
        this.util.spinnerStop();
        this.errorDialog(
          WebResponseService.messages.msg_err_proc_req.heading,
          WebResponseService.messages.msg_err_proc_req.message,
          (res1) => {
            setTransactionResponseBehavior(false, false, true, "thankyou", "");
            this.dataService.pushCancelTransaction("Failed");
          },
        );
      },
    );
  }

  handleTransactionResponse(transactionResponse) {
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
    // this.util.spinnerStart("");

    let denom = JSON.parse(String(sessionStorage.getItem("currentDenom")));
    const walletAmount = ApplicationData.customer.collectedAmount;

    if ((denom && walletAmount) || (denom && !walletAmount)) {
      // Default flow including acceptorStack call
      this.apiResponse.acceptorStack().subscribe(
        async (stackResponse: any) => {
          consoleLog(
            "transaction-review.component.ts",
            "Requested Drop Cash",
            stackResponse,
          );

          if (
            stackResponse["code"] == "0000" ||
            stackResponse["code"] == "CSH_ACP_0000"
          ) {
            this.dataService.subject.next("STACK STATUS SUCCESS");
            let stackDetail = [];
            if (stackResponse["data"]) {
              stackDetail = stackResponse["data"];
            }

            this.apiResponse
              .updateTransactionStatus("Success", stackDetail)
              .subscribe(
                (statusResponse: any) => {
                  setTransactionStatus(
                    statusResponse["data"]["transactionStatus"],
                  );

                  this.apiResponse
                    .TWARE_endTransaction()
                    .subscribe((endTransactionResponse: any) => {
                      if (endTransactionResponse["statusCode"] == "00") {
                        sessionStorage.removeItem("TWARE_transactionId");
                      }
                    });
                },
                (err) => {
                  setTransactionStatus("Suspect");
                  this.dataService.subject.next("Transaction Suspected");
                },
              );

            sessionStorage.setItem("pendingDrop", "false");
            ApplicationData.sessionTransaction.denominationsStacked = true;
          } else {
            sessionStorage.setItem("pendingDrop", "true");
            this.dataService.subject.next("STACK STATUS PENDING");
          }

          this.componentResult.emit({
            step: true,
            value: "Transaction Completed",
          });
          this.util.spinnerStop();
        },
        (error: any) => {
          this.handleErrorFlow(error);
        },
      );
    } else if (walletAmount && !denom) {
      consoleLog(
        "transaction-review.component.ts",
        "Skipping acceptor stack due to no denom",
      );

      this.apiResponse.updateTransactionStatus("Success", []).subscribe(
        (statusResponse: any) => {
          setTransactionStatus(statusResponse["data"]["transactionStatus"]);

          this.apiResponse
            .TWARE_endTransaction()
            .subscribe((endTransactionResponse: any) => {
              if (endTransactionResponse["statusCode"] == "00") {
                sessionStorage.removeItem("TWARE_transactionId");
              }
            });
        },
        (err) => {
          setTransactionStatus("Suspect");
          this.dataService.subject.next("Transaction Suspected");
        },
      );

      sessionStorage.setItem("pendingDrop", "false");
      ApplicationData.sessionTransaction.denominationsStacked = true;

      this.componentResult.emit({ step: true, value: "Transaction Completed" });
      this.util.spinnerStop();
    } else {
      consoleLog(
        "transaction-review.component.ts",
        "No denom and no wallet amount - handle this case",
      );
    }
  }

  handleErrorFlow(error: any) {
    this.dataService.subject.next("STACK STATUS ERROR");
    this.apiResponse.updateCashAcceptorHealth(
      error["errors"]["errorCode"],
      error["errors"]["errorMessage"],
    );
    this.dataService.subject.next("Pushing Device Health Errors");

    if (this.completingCall) {
      ApplicationData.sessionTransaction.responseBehavior.isSuccess;
      sessionStorage.setItem("pendingDrop", "true");
      this.componentResult.emit();
    } else {
      this.cannotAddMoreCash = true;
      this.dataService.subject.next("Escrow is Full");
      this.errorDialog(
        WebResponseService.messages.err_accept_cash.heading,
        WebResponseService.messages.err_accept_cash.message,
        (res) => {},
      );
    }

    this.util.spinnerStop();
  }

  errorDialog(title: string, message: string, callback: Function): void {
    this.util.dialog(
      message,
      "",
      ApplicationData.dialogType._MESSAGE,
      ApplicationData.dialogIcon._ERROR,
      (result) => {
        callback(result);
      },
    );
  }

  proceed() {
    if (
      this.depositedCash > 0 ||
      ApplicationData.customer.collectedAmount > 0
    ) {
      if (
        this.depositedCash + ApplicationData.customer.collectedAmount >=
        this.billDetail.amount
      ) {
        this.completeTransaction();
        console.log("Transaction completed"); // Log message for transaction completion
      } else {
        this.errorDialog(
          "Information",
          "Deposited amount is less than billing amount, deposit Rs." +
            (this.billDetail.amount - this.depositedCash) +
            " more to proceed.",
          (res) => {},
        );
      }
    } else {
      this.cashAcceptor.startDepositFlow();
      console.log("Started cash deposit flow"); // Log message for starting cash deposit flow
    }
  }
}
