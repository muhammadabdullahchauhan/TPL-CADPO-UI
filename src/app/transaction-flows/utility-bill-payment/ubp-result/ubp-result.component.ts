import { Component, EventEmitter, Output } from "@angular/core";
import { Router } from "@angular/router";
import { AppComponent } from "src/app/app.component";
import { DataService } from "src/app/classes/DataService";
import {
  clearTransactionSession,
  getAccountTitle,
  getDepositMethod,
  getTransactionData,
  getTransactionNumber,
  getTransactionStatus,
  getTransactionStatusCode,
  logoutCustomer,
  setTransactionStatus,
  getAccountNumber,
  getbillingCompanyName,
} from "src/app/classes/GlobalFunctions";
import { speak } from "src/app/classes/Initializer";
import { ApplicationData } from "src/app/classes/application";
import { SpinnerService } from "src/app/dialogs/loading-dialog/spinner.service";
import { WebResponseService } from "src/app/web-response.service";
import { checkSpecificDeviceHealth } from "src/app/classes/GlobalFunctions";

@Component({
  selector: "app-ubp-result",
  templateUrl: "./ubp-result.component.html",
  styleUrls: ["./ubp-result.component.css"],
})
export class UbpResultComponent {
  accountTitle: any;
  areButtonsVisible: boolean = true;
  isCashStuck: boolean = false;
  amount: any;
  spinner: any;
  skipReceipt: boolean = false;
  activeBtn: string = "";
  btnIsBusy: boolean = false;
  recieptPending: boolean = true;
  defaultTimer: any;
  componentLabeling: any;
  apiData: any;
  isSuccess: any;
  confirmationMessage = "";
  t_id: any;
  denominations: any;
  denominationsArray = new Array();

  billDetail: any;
  accountNumber: string;
  transactionNumber: string;
  companyName: string;

  @Output() innerSteps = new EventEmitter<any>();

  constructor(
    private dataService: DataService,
    private _router: Router,
    private apiResponse: WebResponseService,
    private util: AppComponent,
    private spinnerService: SpinnerService,
  ) {
    this.isCashStuck = ApplicationData.sessionTransaction.isCashStuck || false;
    if (this.isCashStuck) {
      this.areButtonsVisible = false;
    }

    this.isSuccess =
      ApplicationData.sessionTransaction.responseBehavior.isSuccess;
    this.componentLabeling = ApplicationData.labeling.transaction_result;

    this.billDetail = getTransactionData();

    this.skipReceipt = ApplicationData.sessionTransaction.skippingReceipt;

    if (!this.skipReceipt) {
      if (
        getTransactionStatusCode() == "99" ||
        getTransactionStatusCode() == "02" ||
        this.isCashStuck
      ) {
        this.printCommand();
        this.recieptPending = false;
      }
    }

    this.accountNumber = getAccountNumber();
    this.transactionNumber = getTransactionNumber();
    this.accountTitle = getAccountTitle();
    this.companyName = getbillingCompanyName();
    this.amount = sessionStorage.getItem("currentAmount");
    console.log("Amount Collected:", this.amount);
    this.checkDeviceHealth();

    // Ensure billDetail.amount is a number
    const billAmount = Number(this.billDetail.amount);
    console.log("Bill Detail Amount:", billAmount);

    // Calculate and set collectedAmount
    ApplicationData.customer.collectedAmount = this.amount - billAmount;
    console.log("Wallet Amount:", ApplicationData.customer.collectedAmount);

    if (
      getTransactionStatus() == "Success" ||
      getTransactionStatus() == "Pending"
    ) {
      localStorage.setItem("refreshed", "result");
      this.takePicture();

      console.log(this.amount);
      this.t_id = getTransactionNumber();
      if (
        getDepositMethod() == ApplicationData.depositMethods._CASH ||
        getDepositMethod() == ApplicationData.depositMethods._CASH_BILL_PAYMENT
      ) {
        if (sessionStorage.getItem("denomText") != null) {
          this.denominations = sessionStorage.getItem("denomText");
          this.denominationsArray = this.denominations.split(",");
        }
      }

      this.util.spinnerStart(
        WebResponseService.messages.msg_loading_start_cash_transaction.message,
      );

      if (!ApplicationData.sessionTransaction.denominationsStacked) {
        if (
          getDepositMethod() == ApplicationData.depositMethods._CASH &&
          ApplicationData.perefernces.batchCapacity != "Full"
        ) {
          this.dataService.subject.next("Cash drop pending");
          this.skipReceipt = true;
          this.apiResponse.updateTransactionStatus("Suspect", []).subscribe(
            (statusResponse: any) => {
              this.printCommand();
            },
            (err) => {
              this.printCommand();
            },
          );
          setTransactionStatus("Success");
          this.util.spinnerStop();
          setTimeout(() => {
            this.endTransaction();
          }, 4000);

          return;
        }
      } else {
        setTransactionStatus("Success");
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

  // Other methods unchanged

  checkDeviceHealth() {
    const deviceHealth = checkSpecificDeviceHealth("Receipt Printer");

    if (deviceHealth !== "OK") {
      this.areButtonsVisible = false; // Hide buttons if device is not OK
    } else {
      this.areButtonsVisible = true; // Show buttons if device is OK
    }
  }

  printCommand() {
    this.activeBtn = "print";
    this.btnIsBusy = true;
    setTimeout(() => {
      this.btnIsBusy = false;
    }, 20000);

    clearTimeout(this.defaultTimer);
    this.printReceipt((res) => {
      if (res) {
        this.dataService.subject.next("Receipt Printed");
        speak(this.componentLabeling.text_to_speech.collect_receipt);
      } else {
        this.dataService.subject.next("Receipt Printing Error");
      }

      setTimeout(() => {
        this.endTransaction();
      }, 6000);
    });
  }

  printReceipt(callback: Function) {
    if (ApplicationData.sessionTransaction.skippingReceipt) {
      callback(false);
    }

    this.apiResponse.printTransactionReceipt().subscribe(
      (data) => {
        this.apiData = data;
        console.log(this.apiData);
        if (
          this.apiData.code == "0000" ||
          this.apiData.code == "RCPT_PTR_0000"
        ) {
          callback(true);
          this.apiResponse
            .ledToggle(
              ApplicationData.ledArray._LED_RECEIPT_PRINTER,
              ApplicationData.ledArray._LED_OPTION_BLINK,
            )
            .subscribe((data) => {
              setTimeout(() => {
                this.apiResponse
                  .ledToggle(
                    ApplicationData.ledArray._LED_RECEIPT_PRINTER,
                    ApplicationData.ledArray._LED_OPTION_OFF,
                  )
                  .subscribe((data) => {});
              }, 4000);
            });
        } else {
          this.dataService.subject.next(
            "Receipt Printing Result: " + this.apiData.code,
          );
          callback(false);
        }
        clearTransactionSession();
      },
      (err: any) => {
        clearTransactionSession();
        this.dataService.subject.next(
          "Receipt Printing Result: " + err["code"],
        );
        callback(false);
      },
    );
  }

  skipPrint() {
    this.activeBtn = "green";
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
    if (!WebResponseService.settings.session_maintain) {
      logoutCustomer();
    }
    console.log(this.componentLabeling.text_to_speech.greeting);
    speak(this.componentLabeling.text_to_speech.greeting);
  }

  endTransaction() {
    clearTimeout(this.defaultTimer);
    this._router.navigate(["thankyou"]);
  }
}
