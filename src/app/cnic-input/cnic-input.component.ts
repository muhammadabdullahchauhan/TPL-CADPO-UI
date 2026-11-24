import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { WebResponseService } from '../web-response.service';
import { performCancelTransaction, clearTransactionSession, consoleLog, getDepositMethod, LogMethod, authorizeCustomer, getAccountTitle, getTransactiontTitle, logoutCustomer } from '../classes/GlobalFunctions';
import { ApplicationData } from '../classes/application';
import { Initializer, speak } from '../classes/Initializer';
import { MaskPipe } from '../Pipes/Maskings';
import { DataService } from '../classes/DataService';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-cnic-input',
  templateUrl: '../../assets/htmls/cnic-input.component.html',
  styleUrls: ['./cnic-input.component.css']
})
export class CnicInputComponent {

  cnicValue = "";
  isScanning = false;
  bio_session_attempt: number = 0;
  nadra_verify_attempt: number = 0;
  returnToHome: boolean = false;
  componentLabeling: any;
  form_direction: any;
  authorizedDenominations: any;
  nonAuthorized: boolean = false;
  cnicInputLength = new Array(15);
  currentAccountInputIndex = 0;
  @ViewChild('inputCNIC') cnicText: ElementRef;
  @Output() componentResult = new EventEmitter<any>();

  acccountTitle: any = "";

  constructor(private _router: Router, private apiResponse: WebResponseService, private initService: Initializer, private app: AppComponent, private masking: MaskPipe, private dataService: DataService) {

    localStorage.setItem("refreshed", "cnic");

    this.componentLabeling = ApplicationData.labeling.cnic_screen;
    this.form_direction = ApplicationData.labeling.localization.settings.direction;
    speak(this.componentLabeling.text_to_speech.onload);
    
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
    this.authorizedDenominations = "[" + this.authorizedDenominations.replace(/,\s*$/, "") + "]";

    this.initService.startMonitoring();
  }

  @LogMethod
  public verifyingBiometric() {

    this.cnicValue = this.cnicText.nativeElement.value;
    if (this.cnicValue.length < 15) {
      this.app.dialog(WebResponseService.messages.error_provide_cnic.heading, WebResponseService.messages.error_provide_cnic.message, ApplicationData.dialogType._MESSAGE, ApplicationData.dialogIcon._WARNING, res => { }, "CashDepositOtherParentComponent");
      return;
    }
    ApplicationData.customer.CNIC = this.cnicValue;
    this.dataService.subject.next("CNIC Entered: " + this.masking.transform(this.cnicValue.replace(/-/g, "")));
    
    if (ApplicationData.sessionTransaction.biometricRequired) {
      this.initService.stopMonitoring();
      this.app.spinnerStart("");

      this.apiResponse.initTransaction().subscribe(
        (responseInit) => {
          if (responseInit["statusCode"] == "00") {
            ApplicationData.sessionTransaction.systemreferencenumber = responseInit["data"].systemReferenceNumber;
          
            this.apiResponse
              .TWARE_startTransaction(getTransactiontTitle(), responseInit["data"].systemReferenceNumber)
              .subscribe(
                (startTransactionResponse: any) => {
                  consoleLog("cnic-input.components.ts", "Response Start Tware Transaction", startTransactionResponse);
                
                  // ✅ CUSTOMER SCREENING INSTEAD OF VALIDATION
                  this.apiResponse.customerScreening().subscribe(
                    (screeningResponse: any) => {
                      console.log("Customer Screening Response:", screeningResponse);
                      this.app.spinnerStop();

                      if (screeningResponse.statusCode === "00") {
                        console.log("Customer Screening Success");
                        this.dataService.subject.next("customer screening success");
                        this.callToBioMetric();
                      } else {
                        this.initService.startMonitoring();
                        console.warn("Customer Screening Failed:", screeningResponse);
                        this.dataService.subject.next("Customer screening failed");
                        this.app.dialog(
                          "Error!",
                          "Your transaction cannot be processed at the moment.",
                          ApplicationData.dialogType._MESSAGE,
                          ApplicationData.dialogIcon._ERROR,
                          () => {
                            this.dataService.pushCancelTransaction("failed");
                          }
                        );
                      }
                    },
                    (err) => {
                      console.error("Customer Screening API Error:", err);
                      this.app.spinnerStop();
                        this.initService.startMonitoring();
                      this.dataService.subject.next("Customer screening API failed");
                      this.app.dialog(
                        "Sorry!",
                        "Your transaction cannot be processed at the moment, please try again.",
                        ApplicationData.dialogType._MESSAGE,
                        ApplicationData.dialogIcon._ERROR,
                        () => {
                          this.dataService.pushCancelTransaction("failed");
                        }
                      );
                    }
                  );
                },
                (err) => {
                    this.initService.startMonitoring();
                  console.error("Start TWARE Transaction Failed:", err);
                  this.app.spinnerStop();
                  this.dataService.pushCancelTransaction("failed");
                }
              );
          } else {
              this.initService.startMonitoring();
            this.app.spinnerStop();
            this.dataService.subject.next("Initialization Failed");
            this.app.dialog(
              "Sorry!",
              "Your transaction cannot be processed at the moment, please try again later.",
              ApplicationData.dialogType._MESSAGE,
              ApplicationData.dialogIcon._ERROR,
              () => {
                this.dataService.pushCancelTransaction("failed");
              }
            );
          }
        },
        (err) => {
            this.initService.startMonitoring();
          console.error("Init Transaction Error:", err);
          this.app.spinnerStop();
          this.dataService.subject.next("Initialization Failed");
          this.app.dialog(
            "Sorry!",
            "Your transaction cannot be processed at the moment, please try again later.",
            ApplicationData.dialogType._MESSAGE,
            ApplicationData.dialogIcon._ERROR,
            () => {
              this.dataService.pushCancelTransaction("failed");
            }
          );
        }
      );
    }

    else {
      this.app.spinnerStart("");
      authorizeCustomer();
      ApplicationData.customer.CNIC = this.cnicValue;

      this.apiResponse.initTransaction().subscribe(
        (responseInit) => {
          if (responseInit["statusCode"] == "00") {
            ApplicationData.sessionTransaction.systemreferencenumber = responseInit['data'].systemReferenceNumber;
            this.apiResponse.TWARE_startTransaction(getTransactiontTitle(), responseInit['data'].systemReferenceNumber).subscribe(
              (startTransactionResponse: any) => {
                consoleLog("cnic-input.components.ts", "Response Start Tware Transaction", startTransactionResponse);
                
                // ✅ CUSTOMER SCREENING
                this.apiResponse.customerScreening().subscribe(
                  (screeningResponse: any) => {
                    console.log("Customer Screening Response:", screeningResponse);
                    this.app.spinnerStop();

                    if (screeningResponse.statusCode === "00") {
                      console.log("Customer Screening Success");
                      this.dataService.subject.next("customer screening success");
                        this.initService.startMonitoring();
                      this.componentResult.emit({ step: true, value: "CNIC Taken" });
                    } else {
                        this.initService.startMonitoring();
                      console.warn("Customer Screening Failed:", screeningResponse);
                      this.dataService.subject.next("Customer screening failed");
                      this.app.dialog(
                        "Error!",
                        "Your transaction cannot be processed at the moment.",
                        ApplicationData.dialogType._MESSAGE,
                        ApplicationData.dialogIcon._ERROR,
                        () => {
                          this.dataService.pushCancelTransaction("failed");
                        }
                      );
                    }
                  },
                  (err) => {
                      this.initService.startMonitoring();
                    console.error("Customer Screening API Error:", err);
                    this.app.spinnerStop();
                    this.dataService.subject.next("Customer screening API failed");
                    this.app.dialog(
                      "Sorry!",
                      "Your transaction cannot be processed at the moment, please try again.",
                      ApplicationData.dialogType._MESSAGE,
                      ApplicationData.dialogIcon._ERROR,
                      () => {
                        this.dataService.pushCancelTransaction("failed");
                      }
                    );
                  }
                );
              },
              (err) => {
                  this.initService.startMonitoring();
                this.dataService.pushCancelTransaction();
                this.app.spinnerStop();
              }
            );
          } else {
              this.initService.startMonitoring();
            this.app.spinnerStop();
            this.dataService.subject.next("Initialization Failed");
            this.app.dialog(
              "Sorry!",
              "Your transaction cannot be processed at the moment, please try again later",
              ApplicationData.dialogType._MESSAGE,
              ApplicationData.dialogIcon._ERROR,
              (res: any) => {
                this.dataService.pushCancelTransaction();
              }
            );
          }
        },
        (err) => {
            this.initService.startMonitoring();
          this.app.spinnerStop();
          this.dataService.subject.next("Initialization Failed");
          this.app.dialog(
            "Sorry!",
            "Your transaction cannot be processed at the moment, please try again later",
            ApplicationData.dialogType._MESSAGE,
            ApplicationData.dialogIcon._ERROR,
            (res: any) => {
              this.dataService.pushCancelTransaction();
            }
          );
        }
      );
    }
  }

  handleError() {
    this.dataService.pushCancelTransaction();
    logoutCustomer();
    clearTransactionSession();
    this.app.spinnerStop();
    this._router.navigate(['thankyou']);
  }

  @LogMethod
  callToBioMetric() {
    speak(this.componentLabeling.text_to_speech.captureBiometric)
    this.isScanning = true;
    this.bio_session_attempt++;
    ApplicationData.perefernces.apiCall = true;
    this.dataService.pushHardwareBusy(true);

    this.apiResponse.getBiometricCapture().subscribe((nadraResponse) => {
      this.dataService.pushHardwareBusy(false);

      consoleLog("cnic-input.components.ts", "Response Biometric", nadraResponse);
      this.apiResponse.ledToggle(ApplicationData.ledArray._LED_BIOMETRIC, ApplicationData.ledArray._LED_OPTION_OFF).subscribe(() => {});

      ApplicationData.perefernces.apiCall = false;
      this.isScanning = false;

      if ((nadraResponse["code"] == "0000" || nadraResponse["code"] == "BIO_0000") && nadraResponse["data"]["fingerprintIso"] != "") {
        this.dataService.subject.next("Biometric Captured");
        this.bio_session_attempt = 0;
        this.app.spinnerStart("");

        if (ApplicationData.sessionTransaction.systemreferencenumber != "") {
          this.callNadraVerification(nadraResponse["data"]["fingerprintIso"]);
          console.log("System Reference Number:", ApplicationData.sessionTransaction.systemreferencenumber);
        } else {
          console.log("System Reference Number not available");
          this.apiResponse.initTransaction().subscribe(
            (responseInit) => {
              if (responseInit["statusCode"] == "00") {
                ApplicationData.sessionTransaction.systemreferencenumber = responseInit['data'].systemReferenceNumber;
                this.apiResponse.TWARE_startTransaction(getTransactiontTitle(), responseInit['data'].systemReferenceNumber).subscribe(
                  (startTransactionResponse: any) => {
                    consoleLog("cnic-input.components.ts", "Response Start Tware Transaction", startTransactionResponse);

                    if (startTransactionResponse["code"] == "0000") {
                      sessionStorage.setItem("TWARE_transactionId", startTransactionResponse["data"]["transactionId"]);
                      this.callNadraVerification(nadraResponse["data"]["fingerprintIso"]);
                    } else {
                      this.dataService.pushCancelTransaction();
                      logoutCustomer();
                      clearTransactionSession();
                      this.app.spinnerStop();
                    }
                  },
                  (err) => {
                    this.dataService.pushCancelTransaction();
                    logoutCustomer();
                    clearTransactionSession();
                    this.app.spinnerStop();
                  }
                );
              } else {
                this.dataService.subject.next("Initialization Failed");
                this.app.dialog(
                  "Sorry!",
                  "Your transaction cannot be processed at the moment, please try again later",
                  ApplicationData.dialogType._MESSAGE,
                  ApplicationData.dialogIcon._ERROR,
                  () => {
                    this.dataService.pushCancelTransaction();
                  }
                );
              }
            },
            (err) => {
              this.dataService.subject.next("Initialization Failed");
              this.app.dialog(
                "Sorry!",
                "Your transaction cannot be processed at the moment, please try again later",
                ApplicationData.dialogType._MESSAGE,
                ApplicationData.dialogIcon._ERROR,
                () => {
                  this.dataService.pushCancelTransaction();
                }
              );
            }
          );
        }
      } else {
        this.initService.startMonitoring();
        this.dataService.subject.next("Biometric Result : " + nadraResponse["code"]);
        if (this.bio_session_attempt <= WebResponseService.settings.biometric_attempts_count) {
          this.app.dialog(
            WebResponseService.messages.msg_biometric_retry.heading,
            WebResponseService.messages.msg_biometric_retry.message,
            ApplicationData.dialogType._CONFIRMATION,
            ApplicationData.dialogIcon._CONFIRMATION,
            (res) => {
              console.log("Dialog result:", res);
              if (res === true) {
                this.dataService.subject.next("Biometric Capture Attempt: " + this.bio_session_attempt);
                this.isScanning = true;
                this.callToBioMetric();
              } else {
                ApplicationData.perefernces.apiCall = false;
                this.dataService.subject.next("Biometric Capture Attempt Cancelled by user");
                this.homeScreen();
              }
            },
            "CashDepositOtherParentComponent"
          );
        } else {
          this.app.dialog(WebResponseService.messages.msg_biometric_failed.heading, WebResponseService.messages.msg_biometric_failed.message, ApplicationData.dialogType._MESSAGE, ApplicationData.dialogIcon._ERROR, () => {
            this.homeScreen();
          }, "CashDepositOtherParentComponent");

          this.apiResponse.ledToggle(ApplicationData.ledArray._LED_BIOMETRIC, ApplicationData.ledArray._LED_OPTION_OFF).subscribe(() => {});
          ApplicationData.perefernces.apiCall = false;
        }
        this.dataService.subject.next("Biometric Scanning Failed");
      }
    }, (error) => {
      this.initService.startMonitoring();
      this.apiResponse.ledToggle(ApplicationData.ledArray._LED_BIOMETRIC, ApplicationData.ledArray._LED_OPTION_OFF).subscribe(() => {});
      this.app.dialog(WebResponseService.messages.msg_biometric_failed.heading, WebResponseService.messages.msg_biometric_failed.message, ApplicationData.dialogType._MESSAGE, ApplicationData.dialogIcon._ERROR, () => { }, "CashDepositOtherParentComponent");

      ApplicationData.perefernces.apiCall = false;
      this.dataService.subject.next("Biometric Result : " + error["code"]);
      this.homeScreen();
    });
  }

  @LogMethod
  callNadraVerification(fpISO: string) {
    ApplicationData.perefernces.apiCall = true;
    this.nadra_verify_attempt++;
    this.dataService.pushHardwareBusy(true);
    this.apiResponse.getNadraVerification(fpISO, this.cnicValue).subscribe((response) => {
      console.log("System Reference Number:", ApplicationData.sessionTransaction.systemreferencenumber);
      this.app.spinnerStop();
      this.dataService.pushHardwareBusy(false);
      consoleLog("cnic-input.components.ts", "Response Nadra Verification", response);
      ApplicationData.perefernces.apiCall = false;

      if (response["statusCode"] == "00") {
        this.dataService.subject.next("Biometric Verification Success");
        ApplicationData.customer.CNIC = this.cnicValue;
        authorizeCustomer();
        this.componentResult.emit({ step: true, value: "Nadra Verified" });
      } else {
        this.initService.startMonitoring();
        this.dataService.subject.next("Biometric Verification Failed");
        if (this.nadra_verify_attempt >= WebResponseService.settings.biometric_attempts_count) {
          this.app.dialog("Retry Limit Exceeded", response["responseMessage"], ApplicationData.dialogType._MESSAGE, ApplicationData.dialogIcon._ERROR, () => {
            this.isScanning = false;
            this.dataService.pushCancelTransaction("Failed");
          }, "CashDepositOtherParentComponent");
        } else {
          this.app.dialog(
            "Error!",
            response["responseMessage"],
            ApplicationData.dialogType._CONFIRMATION,
            ApplicationData.dialogIcon._ERROR,
            (res) => {
              if (res === true) {
                this.isScanning = false;
                this.callToBioMetric();
              } else {
                this.dataService.pushCancelTransaction("cancelled");
              }
            },
            "CashDepositOtherParentComponent"
          );
        }
      }
    }, err => {
      this.app.spinnerStop();
      this.returnToHome = true;
      this.dataService.subject.next("Biometric Verification Failed");
      this.app.dialog(WebResponseService.messages.err_nadra_verification.heading, WebResponseService.messages.err_nadra_verification.message, ApplicationData.dialogType._MESSAGE, ApplicationData.dialogIcon._ERROR, () => {
        this.homeScreen();
      }, "CashDepositOtherParentComponent");
    });
  }

  @LogMethod
  nextScreen() {
    this._router.navigate([ApplicationData.sessionTransaction.startingComponent]);
  }

  @LogMethod
  homeScreen() {
    clearTransactionSession();
    this._router.navigate(['home']);
  }

  @LogMethod
  public cancelTransaction() {
    this.app.dialog(WebResponseService.messages.confirm_cancel_transaction.heading, WebResponseService.messages.confirm_cancel_transaction.message, ApplicationData.dialogType._CONFIRMATION, ApplicationData.dialogIcon._CONFIRMATION, result => {
      if (result == true) {
        this.dataService.subject.next("Transaction Cancelled");
        performCancelTransaction();
        this.homeScreen();
      }
    }, "CashDepositOtherParentComponent");
  }

  @LogMethod
  ngOnDestroy() {
    this.app.spinnerStop();
  }

  typeNumeric(character: any) {
    if (character == "D") {
      this.cnicText.nativeElement.value = this.cnicText.nativeElement.value.slice(0, -1);
    } else if (character == "C") {
      this.cnicText.nativeElement.value = "";
    } else {
      if (this.cnicText.nativeElement.value.length == 15) return;
      if (this.cnicText.nativeElement.value.length == 5 || this.cnicText.nativeElement.value.length == 13) {
        this.cnicText.nativeElement.value += "-";
      }
      this.cnicText.nativeElement.value += character;
    }
  }
}
