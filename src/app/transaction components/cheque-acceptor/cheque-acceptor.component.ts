import { Component, EventEmitter, OnDestroy, Output } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { AppComponent } from "src/app/app.component";
import { ApplicationData } from "src/app/classes/application";
import { DataService } from "src/app/classes/DataService";
import {
  clearTransactionSession,
  consoleLog,
  logoutCustomer,
} from "src/app/classes/GlobalFunctions";
import { Initializer } from "src/app/classes/Initializer";
import { WebResponseService } from "src/app/web-response.service";
import { setChequeNo } from "src/app/classes/GlobalFunctions";
import { speak } from "src/app/classes/Initializer";
import { LogMethod } from "src/app/classes/GlobalFunctions";

@Component({
  selector: "cheque-acceptor",
  templateUrl: "../../../assets/htmls/cheque-acceptor.component.html",
  styleUrls: ["./cheque-acceptor.component.css"],
})
export class ChequeAcceptorComponent implements OnDestroy {
  componentLabeling: any;
  form_direction: any;
  acceptingCheque: boolean = true;
  cancelationPending: boolean = false;
  chequeResponse: any;
  buttonStateDisabled: boolean = false;
  chequeEntered: boolean = false;
  callCancelled: boolean = false;
  waitingForCheque: boolean = false;
  seekingChequeInterval: any;
  currentImageEventId: string = "";
  chequeRejected: boolean = false;
  scanCount: number = 0; // Add this property
  maxRetries: number = 3; // Add this property
  immediateTimeout: boolean = false; // Flag to indicate immediate timeout

  scannedFrontImage: string = "";
  isChequeScanned: boolean = false;
  isVerifyingCheque: boolean = false;
  isVerificationSuccess: boolean = false;

  get chequeImageSrc(): string {
    const img =
      this.scannedFrontImage ||
      (this.chequeResponse && this.chequeResponse.frontImage) ||
      ApplicationData.sessionTransaction.chequeImage ||
      "";
    if (!img) return "";
    if (img.startsWith("data:")) return img;
    return "data:image/jpeg;base64," + img;
  }

  @Output() triggerPicture = new EventEmitter<any>();
  @Output() triggerCancelTransaction = new EventEmitter<any>();
  @Output() chequeAccepted = new EventEmitter<any>();
  @Output() cancelTransactionDialog = new EventEmitter<any>();
  @Output() triggerCompleteTransaction = new EventEmitter<any>();

  timeLeft: number = 60;
  interval;

  constructor(
    private apiResponse: WebResponseService,
    private util: AppComponent,
    private initService: Initializer,
    private dataService: DataService,
    public dialog: MatDialog,
    private _router: Router,
  ) {
    this.componentLabeling = ApplicationData.labeling.transaction_review;
    this.form_direction =
      ApplicationData.labeling.localization.settings.direction;
    this.initService.startMonitoring();
    this.callCancelled = false;
    // this.startDepositFlow();
  }
  ngOnDestroy(): void {
    this.callCancelled = true;
    this.dataService.pushHardwareBusy(false);
  }

  startDepositFlow() {
    console.log("startDepositFlow");
    this.dataService.pushHardwareBusy(true);
    this.util.switchCamera();
    speak("Please insert your cheque");
    this.seekCheque();
  }

  seekCheque() {
    ApplicationData.sessionTransaction.chequeAlreadyEjected = false;
    this.scannedFrontImage = "";
    this.isChequeScanned = false;
    this.isVerifyingCheque = false;
    this.isVerificationSuccess = false;
    this.chequeEntered = false;
    this.chequeResponse = null;
    this.buttonStateDisabled = true;
    this.initService.startMonitoring("cheque");
    this.waitingForCheque = true;
    this.apiResponse
      .ledToggle(
        ApplicationData.ledArray._LED_CHEQUE_ACCEPTOR,
        ApplicationData.ledArray._LED_OPTION_BLINK,
      )
      .subscribe((data) => {
        return;
      });

    let entryResponsePending: boolean = false;
    this.scanCount++;
    if (!entryResponsePending) {
      entryResponsePending = true;
      this.dataService.pushHardwareBusy(true);
      this.initService.stopMonitoring();
      this.apiResponse.chequeCheckEntry().subscribe(
        (responseEntry: any) => {
          entryResponsePending = false;
          consoleLog(
            "cheque-acceptor.component.ts",
            "Response Check Entry",
            responseEntry,
          );

          this.acceptingCheque = true;
          this.initService.startMonitoring("cheque");
          if (
            responseEntry["code"] == "0000" ||
            responseEntry["code"] == "CHQ_ACP_0000"
          ) {
            clearInterval(this.seekingChequeInterval);
            this.chequeEntered = true;
            this.dataService.subject.next("CHEQUE INSERTED");
            this.initService.stopMonitoring();
            this.apiResponse.chequeScan().subscribe(
              (responseScan: any) => {
                if (
                  responseScan["code"] == "0000" ||
                  responseScan["code"] == "CHQ_ACP_0000"
                ) {
                  this.waitingForCheque = false;
                  this.initService.startMonitoring("cheque");
                  this.chequeEntered = true;
                  this.isChequeScanned = true;
                  this.dataService.pushHardwareBusy(true);
                  this.dataService.pushChequeDeposit(true);
                  speak("Your cheque has been scanned");
                  this.apiResponse
                    .ledToggle(
                      ApplicationData.ledArray._LED_CHEQUE_ACCEPTOR,
                      ApplicationData.ledArray._LED_OPTION_OFF,
                    )
                    .subscribe((data) => {});
                  this.dataService.subject.next("CHEQUE SCANNED");
                  this.takePicture("Cheque Accept");

                  const frontImageBase64 =
                    responseScan["data"] && responseScan["data"]["frontImage"]
                      ? responseScan["data"]["frontImage"]
                      : "";
                  this.scannedFrontImage = frontImageBase64;
                  this.isVerifyingCheque = true;
                  this.initService.stopMonitoring();
                  this.apiResponse.parseCheque(frontImageBase64).subscribe(
                    (parseRes: any) => {
                      this.initService.startMonitoring("cheque");
                      consoleLog(
                        "cheque-acceptor.component.ts",
                        "Response Parse Cheque",
                        parseRes,
                      );
                      const statusCode = parseRes
                        ? String(
                            parseRes["statusCode"] !== undefined
                              ? parseRes["statusCode"]
                              : parseRes["code"] !== undefined
                              ? parseRes["code"]
                              : "",
                          )
                        : "";
                      const isSuccessCode =
                        statusCode === "00" ||
                        statusCode === "0" ||
                        statusCode === "0000";

                      if (parseRes && isSuccessCode && parseRes["data"]) {
                        const parsed =
                          parseRes["data"]["data"] !== undefined &&
                          parseRes["data"]["data"] !== null
                            ? parseRes["data"]["data"]
                            : parseRes["data"];

                        if (this.isValidParsedCheque(parsed)) {
                          ApplicationData.sessionTransaction.parsedChequeData =
                            parsed;
                          ApplicationData.sessionTransaction.isChequeParsed = true;
                          this.isVerificationSuccess = true;
                          setTimeout(() => {
                            this.isVerifyingCheque = false;
                            this.finishChequeProcessing(responseScan);
                          }, 1200);
                        } else {
                          consoleLog(
                            "cheque-acceptor.component.ts",
                            "Cheque Validation Failed (missing required fields):",
                            parsed,
                          );
                          this.isVerifyingCheque = false;
                          this.isVerificationSuccess = false;
                          ApplicationData.sessionTransaction.parsedChequeData =
                            null;
                          ApplicationData.sessionTransaction.isChequeParsed = false;
                          this.handleInvalidCheque();
                        }
                      } else {
                        ApplicationData.sessionTransaction.parsedChequeData =
                          null;
                        ApplicationData.sessionTransaction.isChequeParsed = false;
                        this.isVerifyingCheque = false;
                        this.finishChequeProcessing(responseScan);
                      }
                    },
                    (parseErr: any) => {
                      consoleLog(
                        "cheque-acceptor.component.ts",
                        "Error Parse Cheque",
                        parseErr,
                      );
                      ApplicationData.sessionTransaction.parsedChequeData =
                        null;
                      ApplicationData.sessionTransaction.isChequeParsed = false;
                      this.isVerifyingCheque = false;
                      this.finishChequeProcessing(responseScan);
                    },
                  );
                } else {
                  this.dataService.pushHardwareBusy(false);
                  //    this.rejectCheque();
                  this.chequeEntered = false;
                  this.waitingForCheque = false;
                  this.chequeResponse = false;
                }
              },
              (err) => {
                this.dataService.pushHardwareBusy(false);
                this.rejectCheque();
                this.chequeEntered = false;
                this.waitingForCheque = false;
                this.chequeResponse = false;
              },
            );
          }
        },
        (err: any) => {
          entryResponsePending = false;
          this.dataService.pushHardwareBusy(false);
        },
      );
    }

    setTimeout(() => {
      clearInterval(this.seekingChequeInterval);
      if (!this.chequeEntered) {
        this.retryChequeScan();
      }
    }, 15000);
  }

  isValidParsedCheque(data: any): boolean {
    if (!data) {
      return false;
    }

    const hasPayee =
      data.payee !== null &&
      data.payee !== undefined &&
      String(data.payee).trim() !== "";
    const hasAmountWords =
      data.amount_in_words !== null &&
      data.amount_in_words !== undefined &&
      String(data.amount_in_words).trim() !== "";
    const hasAmountNumber =
      data.amount_in_number !== null &&
      data.amount_in_number !== undefined &&
      String(data.amount_in_number).trim() !== "";
    const hasDate =
      data.date !== null &&
      data.date !== undefined &&
      String(data.date).trim() !== "";

    return hasPayee && hasAmountWords && hasAmountNumber && hasDate;
  }

  handleInvalidCheque() {
    this.dataService.subject.next("INVALID CHEQUE DETECTED");

    // Eject the physical cheque immediately if not already ejected
    if (!ApplicationData.sessionTransaction.chequeAlreadyEjected) {
      ApplicationData.sessionTransaction.chequeAlreadyEjected = true;
      this.apiResponse.chequeCancel().subscribe(
        (res: any) => {
          if (res["code"] === "CHQ_ACP_0000" || res["code"] === "0000") {
            this.dataService.subject.next("CHEQUE RETURN SUCCESS");
          } else {
            this.dataService.subject.next("CHEQUE RETURN FAILED");
          }
        },
        (err: any) => {
          console.error("Error rejecting invalid cheque:", err);
        },
      );
    }

    if (this.scanCount < this.maxRetries) {
      this.util.dialog(
        "Invalid Cheque",
        "Please fill in all the details and try again.",
        ApplicationData.dialogType._RETRY_CANCEL,
        ApplicationData.dialogIcon._WARNING,
        (retry: any) => {
          if (retry) {
            ApplicationData.sessionTransaction.chequeAlreadyEjected = false;
            this.seekCheque();
          } else {
            this.dataService.pushCancelTransaction();
            this.dataService.pushHardwareBusy(false);
          }
        },
      );
    } else {
      this.dataService.subject.next("MAX RETRIES REACHED");
      this.util.dialog(
        "Sorry!",
        "Your transaction cannot be processed at the moment, please try again later",
        ApplicationData.dialogType._MESSAGE,
        ApplicationData.dialogIcon._ERROR,
        (res: any) => {
          this.dataService.pushCancelTransaction();
          this.dataService.pushHardwareBusy(false);
        },
      );
    }
  }

  rejectCheque() {
    if (!ApplicationData.sessionTransaction.chequeAlreadyEjected) {
      ApplicationData.sessionTransaction.chequeAlreadyEjected = true;
      this.apiResponse.chequeCancel().subscribe(
        (res: any) => {
          if (res["code"] === "CHQ_ACP_0000") {
            this.dataService.subject.next("CHEQUE RETURN SUCCESS");
            this.retryChequeScan();
          } else {
            this.dataService.subject.next("CHEQUE RETURN FAILED");
          }
        },
        (error: any) => {},
      );
    } else {
      this.retryChequeScan();
    }

    // Reset immediateTimeout after using it once
    this.immediateTimeout = false;
  }

  retryChequeScan() {
    if (this.scanCount < this.maxRetries) {
      this.util.dialog(
        "Error!",
        "There is an error while scanning cheque, would you like to retry?",
        ApplicationData.dialogType._CONFIRMATION,
        ApplicationData.dialogIcon._WARNING,
        (res: any) => {
          if (res) {
            this.seekCheque();
          } else {
            this.dataService.pushCancelTransaction();
            this.dataService.pushHardwareBusy(false);
          }
        },
      );
    } else {
      this.dataService.subject.next("MAX RETRIES REACHED");
      this.util.dialog(
        "Sorry!",
        "Your transaction cannot be processed at he moment, please try again later",
        ApplicationData.dialogType._MESSAGE,
        ApplicationData.dialogIcon._ERROR,
        (res: any) => {
          this.dataService.pushCancelTransaction();
          this.dataService.pushHardwareBusy(false);
        },
      );
    }
  }

  // takePicture() {
  //   this.triggerPicture.emit();
  // }

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

  proceedCancelTransaction() {
    this.util.switchCamera();
    this.triggerCancelTransaction.emit();
  }

  btnCancelTransaction() {
    this.cancelTransactionDialog.emit();
  }

  completeTransaction() {
    this.util.switchCamera();
    this.triggerCompleteTransaction.emit();
  }

  finishChequeProcessing(responseScan: any) {
    this.chequeResponse = responseScan["data"];
    this.isChequeScanned = true;
    if (this.chequeResponse) {
      ApplicationData.sessionTransaction.chequeImage =
        this.chequeResponse["frontImage"];
    }
    ApplicationData.perefernces.oncesChequeResponse = true;

    if (this.cancelationPending) {
      this.dataService.subject.next("CHEQUE INSERT CANCELING");
      this.proceedCancelTransaction();
      this.dataService.pushHardwareBusy(false);
    } else {
      ApplicationData.sessionTransaction.chequeData = responseScan["data"];
      if (
        ApplicationData.sessionTransaction.isChequeParsed &&
        ApplicationData.sessionTransaction.parsedChequeData &&
        ApplicationData.sessionTransaction.parsedChequeData.cheque_number
      ) {
        setChequeNo(
          ApplicationData.sessionTransaction.parsedChequeData.cheque_number,
        );
      } else if (responseScan["data"] && responseScan["data"]["chequeNo"]) {
        setChequeNo(responseScan["data"]["chequeNo"]);
      }
      this.chequeAccepted.emit(responseScan["data"]);
      this.buttonStateDisabled = false;
      this.dataService.pushHardwareBusy(false);
    }
  }

  deviceError() {
    this.util.dialog(
      WebResponseService.messages.msg_err_proc_req.heading,
      WebResponseService.messages.msg_err_proc_req.message,
      ApplicationData.dialogType._MESSAGE,
      null,
      (res) => {
        clearTransactionSession();
        this._router.navigate(["home"]);
      },
    );
  }
}
