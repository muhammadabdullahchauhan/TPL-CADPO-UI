import { Component, EventEmitter, Input, Output } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { AppComponent } from "src/app/app.component";
import { ApplicationData } from "src/app/classes/application";
import { DataService } from "src/app/classes/DataService";
import {
  consoleLog,
  getAccountNumber,
  getAccountTitle,
  getDepositMethod,
  getEnteredAmount,
  getTransactionData,
  LogMethod,
} from "src/app/classes/GlobalFunctions";
import { Initializer, speak } from "src/app/classes/Initializer";
import { SpinnerService } from "src/app/dialogs/loading-dialog/spinner.service";
import { WebResponseService } from "src/app/web-response.service";
import { MockService } from "src/app/classes/MockService/mock-service.service";
import { CashStuckDialogComponent } from "src/app/dialogs/cash-stuck-dialog/cash-stuck-dialog.component";

declare function addCard(denomination: String, serial: String): any;

@Component({
  selector: "cash-acceptor",
  templateUrl: "../../../assets/htmls/cash-acceptor.component.html",
  styleUrls: ["./cash-acceptor.component.css"],
})
export class CashAcceptorComponent {
  onceAccepted: boolean = false;
  acceptingCash: boolean = false;
  buttonStateDisabled: boolean = false;
  acceptorResponse: boolean = false;
  form_direction: any;
  totalRejected: any;
  collectedCash: any;
  componentLabeling: any;
  public cannotAddMoreCash: boolean = false;
  currentImageEventId: string = "";
  cashAcceptor: any;
  //cancelationPending: boolean = false;
  transactionPending: any;
  depositedCash: number = 0;
  currencyObj = {
    _5000: 0,
    _1000: 0,
    _500: 0,
    _100: 0,
    _75: 0,
    _50: 0,
    _20: 0,
    _10: 0,
    currentNotes: 0,
    totalNotes: 0, // new added
  };
  denomTableRows: "";
  numWords = require("num-words");
  billDetail: any;

  timeLeft: number = 60;
  interval;
  authorizedDenominations: any;
  nonAuthorized: boolean;
  btnIsBusy: boolean = false;
  carryForwardAmount: number = 0;
  buttonMoved: boolean = false; // New flag to track movement
  cashStuckDialogRef: any = null;

  @Output() triggerPicture = new EventEmitter<any>();
  @Output() triggerCancelTransaction = new EventEmitter<any>();
  @Output() cancelTransactionDialog = new EventEmitter<any>();

  @Output() triggerCompleteTransaction = new EventEmitter<any>();
  @Output() triggerOpenShutter = new EventEmitter<any>();

  @Output() cashAccepted = new EventEmitter<any>();
  @Output() cashAccepting = new EventEmitter<any>();
  @Output() setAmount = new EventEmitter<any>();
  @Output() triggerSimulateClaim = new EventEmitter<any>();

  @Input() triggerAcceptCash = new EventEmitter<any>();
  @Input() showSimulateCashStuck: boolean = true;

  constructor(
    private _router: Router,
    private apiResponse: WebResponseService,
    private mock: MockService,
    private initService: Initializer,
    private spinnerService: SpinnerService,
    public dialog: MatDialog,
    private util: AppComponent,
    private dataService: DataService,
  ) {
    this.componentLabeling = ApplicationData.labeling.transaction_review;
    this.form_direction =
      ApplicationData.labeling.localization.settings.direction;
    this.collectedCash = 0;

    if (
      getDepositMethod() == ApplicationData.depositMethods._CASH_BILL_PAYMENT
    ) {
      this.billDetail = getTransactionData();
    }

    if (ApplicationData.customer.collectedAmount > 0) {
      this.carryForwardAmount = ApplicationData.customer.collectedAmount;
      console.log("Carry Forward Amount:", this.carryForwardAmount);
    }

    this.authorizedDenominations = "";
    let responseDenom: any;
    responseDenom = ApplicationData.sessionTransaction.authorizedDenominations;

    for (let objDenomination of responseDenom) {
      if (!objDenomination.isAuthorized) {
        if (getDepositMethod() == ApplicationData.depositMethods._CASH) {
          this.nonAuthorized = true;
        }
        this.authorizedDenominations += objDenomination.denomination + ",";
      }
    }
    this.authorizedDenominations =
      "[" + this.authorizedDenominations.replace(/,\s*$/, "") + "]";
    if (this.authorizedDenominations == "[]") {
      this.authorizedDenominations = "";
    }
  }

  startDepositFlow() {
    ApplicationData.sessionTransaction.valueLimit = getEnteredAmount();
    setTimeout(() => {
      this.btnIsBusy = false;
    }, 2000);
    this.currencyObj._5000 = 0;
    this.currencyObj._1000 = 0;
    this.currencyObj._500 = 0;
    this.currencyObj._100 = 0;
    this.currencyObj._75 = 0;
    this.currencyObj._50 = 0;
    this.currencyObj._20 = 0;
    this.currencyObj._10 = 0;

    // this.service.subject.next("Checking Health");
    // getDeviceHealth(this, 4, (res: any) => { }, "");
    this.acceptCash();
  }

  acceptCash() {
    this.buttonMoved = true;
    this.currencyObj.totalNotes = 0;
    try {
      this.cashAccepting.emit();
      this.util.switchCamera();
      this.buttonStateDisabled = true;
      this.apiResponse
        .ledToggle(
          ApplicationData.ledArray._LED_CASH_ACCEPTOR,
          ApplicationData.ledArray._LED_OPTION_BLINK,
        )
        .subscribe((data) => {});

      // this.initService.startMonitoring("cash");
      ApplicationData.sessionTransaction.cashAcceptorIsBusy = true;
      this.totalRejected = 0;
      this.acceptingCash = true;

      speak(this.componentLabeling.text_to_speech.depositCash);
      this.dataService.subject.next("Proceeding to add cash");
      this.dataService.hardwareBusy.next(true);
      this.initService.stopMonitoring();
      this.apiResponse.acceptorAcceptCash().subscribe(
        (data: any) => {
          this.initService.startMonitoring("cash");

          ApplicationData.sessionTransaction.cashAcceptorIsBusy = false;
          this.apiResponse
            .ledToggle(
              ApplicationData.ledArray._LED_CASH_ACCEPTOR,
              ApplicationData.ledArray._LED_OPTION_OFF,
            )
            .subscribe(
              (data) => {},
              (err) => {},
            );

          this.acceptorResponse = true;
          this.takePicture("Cash Accept");

          consoleLog(
            "transaction-review.component.ts",
            "Requested Accept Cash",
            data,
          );
          this.cashAcceptor = {
            ...data,
          };

          if (
            this.cashAcceptor.code == "0000" ||
            this.cashAcceptor.code == "CSH_ACP_0000"
          ) {
            let sum = 0;
            let denomRow = "";
            for (const denominationData of this.cashAcceptor.data
              .currentDenominations.acceptedDenominations) {
              sum += denominationData.count;
              //    this.service.subject.next(denominationData.denomination + " x " + denominationData.count);
              denomRow +=
                " " +
                denominationData.denomination +
                " x " +
                denominationData.count +
                ",";
            }

            let acceptedAmount = 0;
            for (const denominationData of this.cashAcceptor.data
              .currentDenominations.acceptedDenominations) {
              acceptedAmount +=
                denominationData.count * denominationData.denomination;
            }
            ApplicationData.sessionTransaction.valueLimit = (
              Number(ApplicationData.sessionTransaction.valueLimit) -
              acceptedAmount
            ).toString();
            console.log("Accepted Amount:", acceptedAmount);
            console.log(
              "Remaining Limit:",
              ApplicationData.sessionTransaction.valueLimit,
            );

            this.dataService.subject.next(
              "Denomination(s): " + denomRow.slice(0, -1),
            );
            if (sum > 0) {
              setTimeout(() => {
                this.dataService.subject.next(
                  sum + " Note(s) Accepted in Escrow",
                );
              }, 500);
            }

            if (sum > 0) {
              this.onceAccepted = true;
              this.dataService.pushCashDeposit(true);
            }

            if (ApplicationData.sessionTransaction.cancellationPending) {
              this.proceedCancelTransaction();
            } else {
              document
                .querySelector(".row-animate")
                ?.classList.add("my-col-animate");
              setTimeout(() => {
                document
                  .querySelector(".my-col-1")
                  ?.classList.remove("d-lg-block");
                document
                  .querySelector(".my-col-1")
                  ?.classList.remove("d-xl-block");

                document
                  .querySelector(".my-col-3")
                  ?.classList.add("d-md-block");
                document
                  .querySelector(".my-col-3")
                  ?.classList.add("d-lg-block");
                document
                  .querySelector(".my-col-3")
                  ?.classList.add("d-xl-block");
              }, 500);

              let currentCount =
                this.cashAcceptor.data.currentDenominations.inEscrow;

              this.transactionPending = true;

              this.cashAccepted.emit();
              setTimeout(() => {
                this.calculateCurrentCollection(
                  this.cashAcceptor.data.currentDenominations
                    .acceptedDenominations,
                  currentCount,
                );
              }, 1000);
              sessionStorage.setItem(
                "currentDenom",
                JSON.stringify(this.cashAcceptor.data.finalDenominations),
              );
              let denomArray: any = new Array();
              this.denomTableRows = "";
              Object.keys(this.cashAcceptor.data.finalDenominations).forEach(
                (key) => {
                  let denominationObj =
                    this.cashAcceptor.data.finalDenominations[Number(key)];
                  //  console.log(denominationObj);
                  denomArray.push(
                    denominationObj.denomination +
                      "x" +
                      denominationObj.serialNumbers.length,
                  );
                  this.denomTableRows +=
                    "<tr><td>" +
                    denominationObj.denomination +
                    "</td><td>" +
                    denominationObj.serialNumbers.length +
                    "</td><td>" +
                    Number(denominationObj.denomination) *
                      Number(denominationObj.serialNumbers.length) +
                    "</td></tr>";
                  this.currencyObj.currentNotes +=
                    denominationObj.serialNumbers.length;
                },
              );

              this.currencyObj.totalNotes += this.currencyObj.currentNotes;
              this.currencyObj.currentNotes = 0;
              sessionStorage.setItem("denomText", denomArray);
              ApplicationData.sessionTransaction.counterDenominations =
                this.cashAcceptor.data.finalDenominations;

              // setTimeout(() => {
              //   checkAcceptorStatus(this, 1);
              // }, 2000);
            }
          } else {
            this.dataService.hardwareBusy.next(false);
            this.dataService.subject.next(
              "ACCEPT CASH RESULT: " + this.cashAcceptor.code,
            );

            // if (this.collectedCash > 0) {
            //   this.openShutter();
            // }

            if (!ApplicationData.sessionTransaction.cancellationPending) {
              this.util.dialog(
                WebResponseService.messages.msg_err_acp_cash.heading,
                WebResponseService.messages.msg_err_acp_cash.message,
                ApplicationData.dialogType._CONFIRMATION,
                ApplicationData.dialogIcon._CONFIRMATION,
                (res) => {
                  if (res) {
                    this.acceptCash();
                  } else {
                    this.dataService.pushCancelTransaction();
                  }
                },
              );
            } else {
              this.dataService.pushCancelTransaction();
            }
          }

          this.acceptingCash = false;
          this.buttonStateDisabled = false;
        },
        (err) => {
          this.initService.startMonitoring("cash");
          this.dataService.hardwareBusy.next(false);
          this.dataService.subject.next("ACCEPT CASH RESULT: " + err["code"]);
          ApplicationData.sessionTransaction.cashAcceptorIsBusy = false;
          this.apiResponse
            .updateCashAcceptorHealth(err["code"], err["message"])
            .subscribe((res) => {});

          if (!ApplicationData.sessionTransaction.cancellationPending) {
            this.util.dialog(
              "Error",
              "There is an error in accepting cash, would you like to retry?",
              ApplicationData.dialogType._CONFIRMATION,
              ApplicationData.dialogIcon._CONFIRMATION,
              (res) => {
                if (res) {
                  this.acceptCash();
                } else {
                  this.proceedCancelTransaction();
                }
              },
            );
          } else {
            this.proceedCancelTransaction();
          }

          // if (ApplicationData.sessionTransaction.cancellationPending) {
          //   this.proceedCancelTransaction();
          // }
          // else {

          //   this.util.dialog(WebResponseService.messages.confirm_dismiss_session.heading, WebResponseService.messages.confirm_dismiss_session.message, ApplicationData.dialogType._CONFIRMATION, ApplicationData.dialogIcon._CONFIRMATION, result => {
          //     if (result == false) {
          //       console.log("Continue Session");
          //       this.startDepositFlow();
          //     }
          //     else {
          //       console.log("End Session");
          //       logoutCustomer();
          //       clearTransactionSession();
          //       this.dialog.closeAll();
          //       this._router.navigate(['home']);
          //       this.initService.startMonitoring();
          //     }

          //   });
          // }
          this.takePicture("Cash Accept");
          this.buttonStateDisabled = false;
        },
      );
    } catch (error) {}
  }

  calculateCurrentCollection(denominationsCollection, totalCount) {
    let currentDenom: any = {};
    let denominationObj, interval;
    let startTime = 0;
    let totalTime = 4000;
    interval = totalTime / totalCount;
    if (interval > 500) {
      interval = 150;
    }
    setTimeout(() => {
      let rejectedCount =
        this.cashAcceptor.data.currentDenominations.totalRejected;
      this.totalRejected = rejectedCount;

      console.log("347 " + this.depositedCash);

      if (this.depositedCash > 0 && !this.acceptingCash) {
        speak(
          this.componentLabeling.text_to_speech.collectedCash.replace(
            "{amount}",
            this.numWords(this.depositedCash),
          ),
        );
      }

      if (this.totalRejected > 0) {
        this.dataService.subject.next(
          this.cashAcceptor.data.currentDenominations.totalRejected +
            " Note(s) rejected",
        );

        if (!this.acceptingCash) {
          if (this.totalRejected < 2) {
            speak(
              this.componentLabeling.text_to_speech.rejectedCashSingular.replace(
                "{notes}",
                this.totalRejected.toString(),
              ),
            );
          } else {
            speak(
              this.componentLabeling.text_to_speech.rejectedCashPlural.replace(
                "{notes}",
                this.totalRejected.toString(),
              ),
            );
          }
        }
      }
    }, interval * totalCount);

    this.dataService.hardwareBusy.next(false);

    Object.keys(denominationsCollection).forEach((key) => {
      denominationsCollection.sort();
      denominationObj = denominationsCollection[Number(key)];

      for (
        let index = 0;
        index < denominationObj.serialNumbers.length;
        index++
      ) {
        let denomNumber = denominationObj.denomination;
        let denomSerial = denominationObj.serialNumbers[index].topSerialNumber;
        this.depositedCash = this.depositedCash + denomNumber;

        this.setAmount.emit(this.depositedCash);
        setTimeout(() => {
          addCard(denomNumber, denomSerial);

          this.collectedCash = this.collectedCash + denomNumber;
          switch (denomNumber) {
            case 5000:
              this.animateDenomCount(denomNumber);
              this.currencyObj._5000 += 1;

              break;
            case 1000:
              this.animateDenomCount(denomNumber);
              this.currencyObj._1000 += 1;
              break;
            case 500:
              this.animateDenomCount(denomNumber);
              this.currencyObj._500 += 1;
              break;
            case 100:
              this.animateDenomCount(denomNumber);
              this.currencyObj._100 += 1;
              break;
            case 75:
              this.animateDenomCount(denomNumber);
              this.currencyObj._75 += 1;
              break;
            case 50:
              this.animateDenomCount(denomNumber);
              this.currencyObj._50 += 1;
              break;
            case 20:
              this.animateDenomCount(denomNumber);
              this.currencyObj._20 += 1;
              break;
            case 10:
              this.animateDenomCount(denomNumber);
              this.currencyObj._10 += 1;
              break;

            default:
              break;
          }
        }, startTime);
        startTime += interval;
      }
      //  this.service.subject.next("Amount Depositing " + this.depositedCash);
    });

    this.collectedCash = 0;
  }

  animateDenomCount(denom: any) {
    document.querySelector(".denomCount-" + denom)?.classList.remove("pulsing");
    setTimeout(() => {
      document.querySelector(".denomCount-" + denom)?.classList.add("pulsing");
    }, 210);
  }

  btnCancelTransaction() {
    this.cancelTransactionDialog.emit();
  }

  completeTransaction() {
    let finalDenomRow = "";

    try {
      for (const denominationData of this.cashAcceptor.data
        .finalDenominations) {
        //    this.service.subject.next(denominationData.denomination + " x " + denominationData.count);
        finalDenomRow +=
          denominationData.denomination + " x " + denominationData.count + ",";
      }

      this.dataService.subject.next(
        "Final Denomination(s): " + finalDenomRow.slice(0, -1),
      );
    } catch (error) {}

    console.log(this.depositedCash);
    this.setAmount.emit(this.depositedCash);
    sessionStorage.setItem("currentAmount", String(this.depositedCash));
    this.dataService.subject.next("Amount Depositing " + this.depositedCash);
    if (this.billDetail) {
      if (this.depositedCash < this.billDetail.amount) {
        this.errorDialog(
          "Information",
          "Deposited amount is less than billing amount, deposit Rs." +
            (this.billDetail.amount - Number(this.depositedCash)) +
            " more to proceed.",
          (res) => {},
        );
      } else {
        this.cashAcceptor = null;
        this.util.switchCamera();

        this.triggerCompleteTransaction.emit();
      }
    } else {
      this.cashAcceptor = null;
      this.util.switchCamera();
      this.triggerCompleteTransaction.emit();
    }
  }

  @LogMethod
  takePicture(eventName: string) {
    console.log(`[takePicture] Called with eventName: "${eventName}"`);

    const eventsCandidate =
      ApplicationData.sessionTransaction.transactionImageEvents;

    let events: any[] = [];
    if (Array.isArray(eventsCandidate)) {
      events = eventsCandidate;
    } else {
      console.warn(
        "[takePicture] transactionImageEvents is not an array!",
        eventsCandidate,
      );
    }

    const eventNameLower = eventName.toLowerCase();

    const event = events.find(
      (e: any) => e.eventName.toLowerCase() === eventNameLower,
    );

    if (event && event.transactionImageEventId != null) {
      // Use event ID as is, no padding
      this.currentImageEventId = event.transactionImageEventId.toString();
      console.log(`[takePicture] Found event:`, event);
      console.log(
        `[takePicture] Set currentImageEventId to: ${this.currentImageEventId}`,
      );
    } else {
      console.warn(
        `[takePicture] Event name '${eventName}' not found. Using fallback ID '0001'.`,
      );
      this.currentImageEventId = "0001";
    }

    console.log(`[takePicture] Triggering picture capture...`);
    // this.pictureTrigger.next(true);
    this.triggerPicture.emit();
  }

  // takePicture() {
  //     this.triggerPicture.emit();
  //   }

  errorDialog(title: string, message: string, callback: Function): void {
    this.util.dialog(
      title,
      message,
      ApplicationData.dialogType._MESSAGE,
      ApplicationData.dialogIcon._ERROR,
      (res) => {
        callback(res);
      },
    );
  }

  stopAcceptingCash() {
    this.acceptingCash = false;
    this.dataService.hardwareBusy.next(false);
  }

  proceedCancelTransaction() {
    // this.util.switchCamera();
    // this.triggerCancelTransaction.emit();
    this.dataService.hardwareBusy.next(false);
    this.dataService.pushCancelTransaction();
  }

  showDenominations() {
    let htmlContent =
      "<table><thead><tr><th>Denominations (PKR)</th><th>Count</th><th>Amount</th></tr></thead><tbody>" +
      this.denomTableRows +
      "</tbody></table>";
    this.util.customerDialog(
      htmlContent,
      ApplicationData.dialogType._MESSAGE,
      () => {},
    );
  }

  get hasWalletAmount(): boolean {
    return (
      ApplicationData.customer.collectedAmount > 0 ||
      this.carryForwardAmount > 0
    );
  }

  get canShowSimulateClaim(): boolean {
    if (!this.showSimulateCashStuck) {
      return false;
    }
    if (
      getDepositMethod() === ApplicationData.depositMethods._CASH_BILL_PAYMENT
    ) {
      return false;
    }
    return true;
  }

  simulateClaim() {
    // Keep monitoring running as requested
    this.buttonStateDisabled = true;
    this.btnIsBusy = true;
    sessionStorage.setItem("currentAmount", String(this.depositedCash || 0));

    console.log(
      "[Simulate Cash Stuck?] Triggered. Deposited Cash:",
      this.depositedCash,
      "Denominations:",
      this.currencyObj,
    );
    this.dataService.subject.next(
      "Simulate Cash Stuck? Triggered (PKR " + this.depositedCash + ")",
    );
    this.triggerSimulateClaim.emit({
      depositedCash: this.depositedCash,
      currencyObj: this.currencyObj,
      totalRejected: this.totalRejected,
    });

    const accountNumber =
      getAccountNumber() ||
      ApplicationData.sessionTransaction.accountNumber ||
      "";
    const accountTitle =
      getAccountTitle() ||
      ApplicationData.sessionTransaction.accountTitle ||
      "";
    const depositAmount = this.depositedCash || 0;
    const enteredAmount = getEnteredAmount() || 0;

    this.openCashStuckDialog(accountNumber, accountTitle, depositAmount, enteredAmount);
  }

  generateClaimId(): string {
    const branchDigits = (ApplicationData.config.branchCode || "").replace(/\D/g, "");
    const deviceDigits = (ApplicationData.config.deviceCode || "").replace(/\D/g, "");
    const refDigits = (
      ApplicationData.sessionTransaction.systemreferencenumber || ""
    ).replace(/\D/g, "");

    let combined = `${branchDigits}${deviceDigits}${refDigits}`;
    const targetLength = 11; // 10-12 digits

    if (combined.length > targetLength) {
      combined = combined.slice(-targetLength);
    }

    while (combined.length < targetLength) {
      const randomDigit = Math.floor(Math.random() * 10).toString();
      combined += randomDigit;
    }

    if (combined.startsWith("0")) {
      const nonZero = Math.floor(Math.random() * 9 + 1).toString();
      combined = nonZero + combined.slice(1);
    }

    return combined;
  }

  openCashStuckDialog(
    accountNumber?: string,
    accountTitle?: string,
    depositAmount?: any,
    enteredAmount?: any,
  ) {
    const accNo =
      accountNumber ||
      getAccountNumber() ||
      ApplicationData.sessionTransaction.accountNumber ||
      "";
    const accTitle =
      accountTitle ||
      getAccountTitle() ||
      ApplicationData.sessionTransaction.accountTitle ||
      "";
    const depAmount =
      depositAmount !== undefined ? depositAmount : this.depositedCash || 0;
    const entAmount =
      enteredAmount !== undefined ? enteredAmount : getEnteredAmount() || 0;

    this.cashStuckDialogRef = this.dialog.open(CashStuckDialogComponent, {
      panelClass: "cash-stuck-dialog-panel",
      maxWidth: "100vw",
      width: "100vw",
      height: "100vh",
      disableClose: true,
      data: {
        accountNumber: accNo,
        accountTitle: accTitle,
        depositAmount: depAmount,
        enteredAmount: entAmount,
      },
    });

    this.cashStuckDialogRef.afterClosed().subscribe((result: any) => {
      this.cashStuckDialogRef = null;

      if (!result) {
        // User cancelled the dialog: re-enable buttons and keep monitoring
        this.buttonStateDisabled = false;
        this.btnIsBusy = false;
        return;
      }

      // Dialog submitted with claimAmount and claimDenominations
      ApplicationData.sessionTransaction.isCashStuck = true;
      ApplicationData.sessionTransaction.claimAmount = result.claimAmount || "";
      ApplicationData.sessionTransaction.claimDenominations =
        result.claimDenominations || "";
      ApplicationData.sessionTransaction.claimId = this.generateClaimId();

      console.log(
        "[CashAcceptor] Claim Submitted -> Claim ID:",
        ApplicationData.sessionTransaction.claimId,
        "Amount:",
        ApplicationData.sessionTransaction.claimAmount,
        "Denom:",
        ApplicationData.sessionTransaction.claimDenominations,
      );

      this.triggerCompleteTransaction.emit();
    });
  }

  ngOnDestroy(): void {
    if (this.cashStuckDialogRef) {
      this.cashStuckDialogRef.close();
      this.cashStuckDialogRef = null;
    }
    this.dataService.hardwareBusy.next(false);
  }
}
