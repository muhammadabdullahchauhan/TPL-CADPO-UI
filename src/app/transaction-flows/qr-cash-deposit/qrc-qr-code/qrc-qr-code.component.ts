import { Component, ElementRef, EventEmitter, Output, ViewChild, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WebResponseService } from 'src/app/web-response.service';
import { performCancelTransaction, clearTransactionSession, consoleLog, getDepositMethod, LogMethod, authorizeCustomer, getAccountTitle, getTransactiontTitle, logoutCustomer, setAccountNumber, setMobileNumber, setAccountTitle, setTransactionPurposeId, setEnteredAmount } from 'src/app/classes/GlobalFunctions';
import { ApplicationData } from 'src/app/classes/application';
import { Initializer, speak } from 'src/app/classes/Initializer';
import { MaskPipe } from 'src/app/Pipes/Maskings';
import { DataService } from 'src/app/classes/DataService';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-qrc-qr-code',
  templateUrl: './qrc-qr-code.component.html',
  styleUrls: ['./qrc-qr-code.component.css']
})
export class QrcQrCodeComponent implements OnInit {
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
      // this.initService.startMonitoring();
      
  
  
    }

    ngOnInit() {
      setAccountNumber("09125478235612");
      setMobileNumber("0332-1541120");
      setAccountTitle("Touch Point Pk");
      setTransactionPurposeId(0);
      this.cnicValue = "42201-1234567-8";
      setEnteredAmount("4000");
      // Wait for 10 seconds
      setTimeout(() => {
        this.app.spinnerStart(""); // Start spinner
    
        // Wait for 2 seconds, then stop spinner and call initQrTransaction()
        setTimeout(() => {
          this.app.spinnerStop();
          this.initQrTransaction();
        }, 2000);
      }, 10000);
    }
    

    initQrTransaction() {
      this.app.spinnerStart(""); // Start spinner
        authorizeCustomer();
        ApplicationData.customer.CNIC = this.cnicValue;
      
        this.apiResponse.initTransaction().subscribe(
          (responseInit) => {
            if (responseInit["statusCode"] == "00") { // SUCCESS
              ApplicationData.sessionTransaction.systemreferencenumber = responseInit['data'].systemReferenceNumber;
              this.apiResponse.TWARE_startTransaction(getTransactiontTitle(), responseInit['data'].systemReferenceNumber).subscribe(
                (startTransactionResponse: any) => {
                  consoleLog("cnic-input.components.ts", "Response Start Tware Transaction", startTransactionResponse);
                  this.componentResult.emit({ step: true, value: "CNIC Taken" });
                  // Handle successful startTransactionResponse here if needed
                  this.app.spinnerStop(); // Stop spinner on success
                },
                (err) => {
                  this.dataService.pushCancelTransaction();
                  this.app.spinnerStop(); // Stop spinner on success
                }
              );
            } else {
              this.app.spinnerStop(); // Stop spinner on success
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
            this.app.spinnerStop(); // Stop spinner on success
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

    @LogMethod
    public verifyingBiometric() {
  
  
      this.cnicValue = this.cnicText.nativeElement.value;
      if (this.cnicValue.length < 15) {
        
        this.app.dialog(WebResponseService.messages.error_provide_cnic.heading, WebResponseService.messages.error_provide_cnic.message, ApplicationData.dialogType._MESSAGE, ApplicationData.dialogIcon._WARNING, res => { }, "CashDepositOtherParentComponent");
  
  
        return;
      }
  
      this.dataService.subject.next("CNIC Entered: " + this.masking.transform(this.cnicValue.replace(/-/g, "")));
  
      if (ApplicationData.sessionTransaction.biometricRequired) {
        this.apiResponse.ledToggle(ApplicationData.ledArray._LED_BIOMETRIC, ApplicationData.ledArray._LED_OPTION_BLINK).subscribe((data) => {
  
        });
  
        this.isScanning = true;
        
  
  
  
        this.initService.stopMonitoring();
  
  
        speak(this.componentLabeling.text_to_speech.captureBiometric)
  
        this.callToBioMetric();
      }
      else {
        this.app.spinnerStart(""); // Start spinner
        authorizeCustomer();
        ApplicationData.customer.CNIC = this.cnicValue;
      
        this.apiResponse.initTransaction().subscribe(
          (responseInit) => {
            if (responseInit["statusCode"] == "00") { // SUCCESS
              ApplicationData.sessionTransaction.systemreferencenumber = responseInit['data'].systemReferenceNumber;
              this.apiResponse.TWARE_startTransaction(getTransactiontTitle(), responseInit['data'].systemReferenceNumber).subscribe(
                (startTransactionResponse: any) => {
                  consoleLog("cnic-input.components.ts", "Response Start Tware Transaction", startTransactionResponse);
                  this.componentResult.emit({ step: true, value: "CNIC Taken" });
                  // Handle successful startTransactionResponse here if needed
                  this.app.spinnerStop(); // Stop spinner on success
                },
                (err) => {
                  this.dataService.pushCancelTransaction();
                  this.app.spinnerStop(); // Stop spinner on success
                }
              );
            } else {
              this.app.spinnerStop(); // Stop spinner on success
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
            this.app.spinnerStop(); // Stop spinner on success
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
      
      
      // Handle error logic in a separate function to avoid code repetition
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
      this.bio_session_attempt++;
      ApplicationData.perefernces.apiCall = true;
      this.dataService.pushHardwareBusy(true);
  
      this.apiResponse.getBiometricCapture().subscribe((nadraResponse) => {
          this.dataService.pushHardwareBusy(false);
  
          consoleLog("cnic-input.components.ts", "Response Biometric", nadraResponse);
          this.apiResponse.ledToggle(ApplicationData.ledArray._LED_BIOMETRIC, ApplicationData.ledArray._LED_OPTION_OFF).subscribe((data) => {});
  
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
                          if (responseInit["statusCode"] == "00") { // SUCCESS
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
                                          // this._router.navigate(['thankyou']);
                                      }
                                  },
                                  (err) => {
                                      this.dataService.pushCancelTransaction();
                                      logoutCustomer();
                                      clearTransactionSession();
                                      this.app.spinnerStop();
                                      // this._router.navigate(['thankyou']);
                                  }
                              );
                          } else {
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
          else {
              this.initService.startMonitoring();
              this.dataService.subject.next("Biometric Result : " + nadraResponse["code"]);
              if (this.bio_session_attempt <= WebResponseService.settings.biometric_attempts_count) {
                  this.app.dialog(WebResponseService.messages.msg_biometric_retry.heading, WebResponseService.messages.msg_biometric_retry.message, ApplicationData.dialogType._CONFIRMATION, ApplicationData.dialogIcon._CONFIRMATION, (res) => {
                      console.log(res);
                      if (res == true) {
                          this.dataService.subject.next("Biometric Capture Attempt: " + this.bio_session_attempt);
                          this.isScanning = true;
                          this.callToBioMetric();
                      }
                      else if (res != "time-dismiss") {
                          ApplicationData.perefernces.apiCall = false;
                        
                          this.dataService.subject.next("Biometric Capture Attempt Cancelled");
                          this.homeScreen();
                      }
                  }, "CashDepositOtherParentComponent");
              }
              else {
                  this.app.dialog(WebResponseService.messages.msg_biometric_failed.heading, WebResponseService.messages.msg_biometric_failed.message, ApplicationData.dialogType._MESSAGE, ApplicationData.dialogIcon._ERROR, res => { }, "CashDepositOtherParentComponent");
  
              
                  this.apiResponse.ledToggle(ApplicationData.ledArray._LED_BIOMETRIC, ApplicationData.ledArray._LED_OPTION_OFF).subscribe((data) => {});
  
                  ApplicationData.perefernces.apiCall = false;
                  this.homeScreen();
              }
              this.dataService.subject.next("Biometric Scanning Failed");
          }
      }, (error) => {
          this.initService.startMonitoring();

          this.apiResponse.ledToggle(ApplicationData.ledArray._LED_BIOMETRIC, ApplicationData.ledArray._LED_OPTION_OFF).subscribe((data) => {});
          this.app.dialog(WebResponseService.messages.msg_biometric_failed.heading, WebResponseService.messages.msg_biometric_failed.message, ApplicationData.dialogType._MESSAGE, ApplicationData.dialogIcon._ERROR, res => { }, "CashDepositOtherParentComponent");
  
          ApplicationData.perefernces.apiCall = false;
          this.dataService.subject.next("Biometric Result : " + error["code"]);
          this.homeScreen();
      });
  }
  
  
  
  
    @LogMethod
    callNadraVerification(fpISO: string) {
  
    //  this.app.spinnerStart(WebResponseService.messages.msg_verification_biometric.message);
  
      ApplicationData.perefernces.apiCall = true;
  
      //  this.dataService.subject.next("Verifying from Nadra");
      this.nadra_verify_attempt++;
      this.dataService.pushHardwareBusy(true);
      this.apiResponse.getNadraVerification(fpISO, this.cnicValue).subscribe((response) => {
        console.log("System Reference Number:", ApplicationData.sessionTransaction.systemreferencenumber);
        this.app.spinnerStop();
        this.dataService.pushHardwareBusy(false);
        consoleLog("cnic-input.components.ts", "Response Nadra Verification", response);
        ApplicationData.perefernces.apiCall = false;
        // if (this.bioDialog != null) {
        //   this.dialogService.stop(this.bioDialog);
        // }
        consoleLog("cnic-input.component.ts", "Nadra Verification", response);
        this.app.spinnerStop();
        if (response["statusCode"] == "00") {
          this.dataService.subject.next("Biometric Verification Success");
          //  this.spinnerService.stop(this.spinner);
  
          ApplicationData.customer.CNIC = this.cnicValue;
  
          authorizeCustomer();
          this.componentResult.emit({ step: true, value: "Nadra Verified" });
        }
        else {
          this.initService.startMonitoring();
          this.dataService.subject.next("Biometric Verification Failed");
          if (this.nadra_verify_attempt >= WebResponseService.settings.biometric_attempts_count) {
            this.app.dialog("Limit Exceeded", response["responseMessage"], ApplicationData.dialogType._MESSAGE, ApplicationData.dialogIcon._ERROR, (res) => {
              this.isScanning = false;
              // clearTransactionSession();
              // this._router.navigate(['home']);
              this.dataService.pushCancelTransaction("Failed");
            }, "CashDepositOtherParentComponent");
          }
          else {
            this.app.dialog("Oops!", response["responseMessage"], ApplicationData.dialogType._MESSAGE, ApplicationData.dialogIcon._ERROR, (res) => {
              this.isScanning = false;
            }, "CashDepositOtherParentComponent");
          }
          //   this.retryNadraBiometric();
        }
      }, err => {
        this.app.spinnerStop();
        this.returnToHome = true;
        this.dataService.subject.next("Biometric Veriication Failed");
        //   this.confirmDialog(WebResponseService.messages.err_nadra_verification.heading, WebResponseService.messages.err_nadra_verification.message, false);
        this.app.dialog(WebResponseService.messages.err_nadra_verification.heading, WebResponseService.messages.err_nadra_verification.message, ApplicationData.dialogType._MESSAGE, ApplicationData.dialogIcon._ERROR, res => {
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
      // this.keyboard.destroy();
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
      }
      else if (character == "C") {
        this.cnicText.nativeElement.value = "";
      }
      else {
        if (this.cnicText.nativeElement.value.length == 15) {
          return;
        }
        if (this.cnicText.nativeElement.value.length == 5 || this.cnicText.nativeElement.value.length == 13) {
          this.cnicText.nativeElement.value += "-";
        }
        this.cnicText.nativeElement.value += character;
      }
    }
  
  
  
  }
  
