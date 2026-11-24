import { AfterViewInit, Component, ElementRef, EventEmitter, Output,  ViewChild, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { MaskPipe } from 'src/app/Pipes/Maskings';
import { AppComponent } from 'src/app/app.component';
import { DataService } from 'src/app/classes/DataService';
import { checkSpecificDeviceHealth,  consoleLog, getAccountNumber, getDepositMethod,  setAccountNumber, setEnteredAmount, setMobileNumber, setTransactionPurposeId, setTransactionPurposeText } from 'src/app/classes/GlobalFunctions';
import { Initializer } from 'src/app/classes/Initializer';
import { MockService } from 'src/app/classes/MockService/mock-service.service';
import { ApplicationData } from 'src/app/classes/application';
import { WebResponseService } from 'src/app/web-response.service';

@Component({
  selector: 'app-ch-own-beneficiary-details',
  templateUrl: './ch-own-beneficiary-details.component.html',
  styleUrls: ['./ch-own-beneficiary-details.component.css']
})
export class ChOwnBeneficiaryDetailsComponent implements AfterViewInit {

  purposeOptions: any;
  selectedPurpose_id: any;
  selectedField: any;
  fetchAccountAttempts: number = 0;
  @ViewChild('inputAccount') txtAccount: ElementRef;
  @ViewChild('inputAmount') txtAmount: ElementRef;
  @ViewChild('inputMobile') txtMobile: ElementRef;
  @ViewChild('inputPurpose') txtPurpose: ElementRef;
  @Output() componentResult = new EventEmitter<any>();
  currentAccountInputIndex = 0;
  multipleOfDenomError: boolean = false;
  exceedAmount: boolean = false;

  isFlipped: boolean = false;
  isFlippedaccount: boolean = false;
  accountsList: any[] = []; // To store accounts list
  selectedAccountNo: string = ''; // To store the selected account number




  constructor(private _router: Router, 
    private apiResponse: WebResponseService, 
    private mock: MockService, 
    private masking: MaskPipe,
    private initService: Initializer, 
    private util: AppComponent, 
    private dataService: DataService,
    private cdr: ChangeDetectorRef) {

    this.initService.startMonitoring();


    this.purposeOptions = ApplicationData.sessionTransaction.transactionPurposeList;

  }

  continueTransaction() {

    if (checkSpecificDeviceHealth("Cash Acceptor") != "OK") {
      this.util.dialog(WebResponseService.messages.msg_err_proc_req.heading, WebResponseService.messages.msg_err_proc_req.message, ApplicationData.dialogType._MESSAGE, ApplicationData.dialogIcon._ERROR, res => {
        this.componentResult.emit("canceltxn");
      });

      return;
    }

    // this.ejejdataService.subject.next("Fetching Account Title");
    this.initService.stopMonitoring();

    //   var spinnerRef = this.spinnerService.start(WebResponseService.messages.msg_loading_fetch_acc_title.message);
    //  this.util.spinnerStart(WebResponseService.messages.msg_loading_fetch_acc_title.message);


    if (checkSpecificDeviceHealth("Receipt Printer") != "OK") {
      this.util.dialog(WebResponseService.messages.msg_receipt_unavailable.heading, WebResponseService.messages.msg_receipt_unavailable.message, ApplicationData.dialogType._CONFIRMATION, ApplicationData.dialogIcon._WARNING, result => {

        if (result) {
          ApplicationData.sessionTransaction.skippingReceipt = true;

          this.fetchAccountTitle();
        }
        else {
          // this.apiResponse.updateTransactionStatus("Cancelled", []).subscribe((res: any) => {
          //   clearTransactionSession();
          //   this._router.navigate(['home']);
          // });
          this.componentResult.emit("canceltxn");
        }
      });
    }
    else {
      this.util.spinnerStop();
      this.fetchAccountTitle();
    }

  }

  fetchAccountTitle() {
    this.util.takePicture("Title Fetch");
    // Comment out the existing API call code
    // this.util.spinnerStart("");
    // this.fetchAccountAttempts++;
    // this.apiResponse.getAccountTitle(getAccountNumber()).subscribe((res) => {
    //   this.initService.startMonitoring();
    //   consoleLog("transaction-input.component.ts", "Fetch Account Title", res);
    //   this.util.spinnerStop();
    //   if (res["statusCode"] == "00") {
    //     ApplicationData.sessionTransaction.state.screens.cd_other_beneficiary_detail.fields.account_num_changed = false;
    //     ApplicationData.sessionTransaction.accountTitle = res["data"]["accountTitle"];
    //     this.dataService.subject.next("Account Title Fetched:" + ApplicationData.sessionTransaction.accountTitle);
    //     this.componentResult.emit({ step: true });
    //   } else {
    //     if (Number(this.fetchAccountAttempts) >= 3) {
    //       this.dataService.subject.next("Error Fetching Account Title (Limit Exceeded)");
    //       this.util.dialog("Limit Exceeded", res["responseMessage"], ApplicationData.dialogType._MESSAGE, ApplicationData.dialogIcon._ERROR, res => {
    //         this.dataService.pushCancelTransaction();
    //       });
    //     } else {
    //       this.dataService.subject.next("Error Fetching Account Title");
    //       this.util.dialog("Oops!", res["responseMessage"], ApplicationData.dialogType._MESSAGE, ApplicationData.dialogIcon._ERROR, res => {
    //         // Optional: Add any additional handling for errors if needed
    //       });
    //     }
    //   }
    // }, err => {
    //   this.util.spinnerStop();
    //   this.initService.startMonitoring();
    //   this.errorDialog(WebResponseService.messages.err_acc_find_attempts.heading, WebResponseService.messages.err_acc_find_attempts.message);
    //   this.dataService.subject.next("Error Fetching Account Title");
    // });




  
    // New code to fetch account title from `accountsList`
    // this.initService.startMonitoring();
    // this.util.spinnerStop();
  
    // const selectedAccount = this.accountsList.find(account => account.accountNo === this.txtAccount.nativeElement.value);
    
    // if (selectedAccount) {
    //   ApplicationData.sessionTransaction.state.screens.cd_other_beneficiary_detail.fields.account_num_changed = false;
    //   ApplicationData.sessionTransaction.accountTitle = selectedAccount.accountTitle;
    //   this.dataService.subject.next("Account Title Fetched:" + ApplicationData.sessionTransaction.accountTitle);
    //   this.componentResult.emit({ step: true });
    // } else {
    //   if (Number(this.fetchAccountAttempts) >= 3) {
    //     this.dataService.subject.next("Error Fetching Account Title (Limit Exceeded)");
    //     this.util.dialog("Limit Exceeded", "Account title not found for the selected account.", ApplicationData.dialogType._MESSAGE, ApplicationData.dialogIcon._ERROR, res => {
    //       this.dataService.pushCancelTransaction();
    //     });
    //   } else {
    //     this.dataService.subject.next("Error Fetching Account Title");
    //     this.util.dialog("Oops!", "Account title not found for the selected account.", ApplicationData.dialogType._MESSAGE, ApplicationData.dialogIcon._ERROR, res => {
    //       // Optional: Add any additional handling for errors if needed
    //     });
    //   }
    // }


    // New code to fetch account title from `accountsList`
  this.util.spinnerStart(""); // Start spinner
  this.initService.startMonitoring();

  const selectedAccount = this.accountsList.find(account => account.accountNo === this.txtAccount.nativeElement.value);

  // Simulate processing time
  setTimeout(() => {
    this.util.spinnerStop(); // Stop spinner

    if (selectedAccount) {
      ApplicationData.sessionTransaction.state.screens.cd_other_beneficiary_detail.fields.account_num_changed = false;
      ApplicationData.sessionTransaction.accountTitle = selectedAccount.accountTitle;
      this.dataService.subject.next("Account Title Fetched:" + ApplicationData.sessionTransaction.accountTitle);
      this.componentResult.emit({ step: true });
    } else {
      if (Number(this.fetchAccountAttempts) >= 3) {
        this.dataService.subject.next("Error Fetching Account Title (Limit Exceeded)");
        this.util.dialog("Limit Exceeded", "Account title not found for the selected account.", ApplicationData.dialogType._MESSAGE, ApplicationData.dialogIcon._ERROR, res => {
          this.dataService.pushCancelTransaction();
        });
      } else {
        this.dataService.subject.next("Error Fetching Account Title");
        this.util.dialog("Oops!", "Account title not found for the selected account.", ApplicationData.dialogType._MESSAGE, ApplicationData.dialogIcon._ERROR, res => {
          // Optional: Add any additional handling for errors if needed
        });
      }
    }
  }, 1000); // Simulate a delay of 500ms for demonstration


}
  

  errorDialog(title: string, message: string): void {

    this.util.dialog(title, message, ApplicationData.dialogType._MESSAGE, ApplicationData.dialogIcon._ERROR, res => {

    });

  }

  cancelTransaction() {
    this.dataService.pushCancelTransaction("customer");
  }

 
  togglePurposeList() {
    this.isFlipped = !this.isFlipped;
    
    console.log("togglePurposeList");
    document.querySelector(".purpose-list-wrapper")?.classList.toggle("open");
    document.querySelector(".purpose-list-wrapper")?.classList.toggle("close");
  }

  focusField(object: any) {

    this.selectedField = object;
  }


  selectPurpose(selectedPurpose: any, optionName: any) {
    this.selectedPurpose_id = selectedPurpose;
    setTransactionPurposeId(selectedPurpose);
    setTransactionPurposeText(optionName);
    this.txtPurpose.nativeElement.value = optionName;

    this.togglePurposeList();
  }

  proceed() {
    console.log(this.selectedPurpose_id);
    if (this.multipleOfDenomError) {
      this.util.dialog(WebResponseService.messages.msg_multiple_tens.heading, WebResponseService.messages.msg_multiple_tens.message, ApplicationData.dialogType._MESSAGE, ApplicationData.dialogIcon._ERROR, res => {

      });
      return;
    }
    // if ((this.exceedAmount || this.multipleOfDenomError) && !this.isBillPayment) {
    //   return;
    // }

    if (this.txtAccount.nativeElement.value.length < WebResponseService.settings.number_of_digits_in_accountNo) {
      this.util.dialog(WebResponseService.messages.err_account_num.message, "", ApplicationData.dialogType._MESSAGE, ApplicationData.dialogIcon._WARNING, res => {

      });
      return;
    }

    if (this.txtMobile.nativeElement.value.length != 12) {
      this.util.dialog(WebResponseService.messages.err_mobile_num.message, "", ApplicationData.dialogType._MESSAGE, ApplicationData.dialogIcon._WARNING, res => {

      });
      return;
    }


    if (Number(this.txtAmount.nativeElement.value) <= 0) {
      this.util.dialog(WebResponseService.messages.msg_err_enter_amount.message, "", ApplicationData.dialogType._MESSAGE, ApplicationData.dialogIcon._WARNING, res => {

      });
      return;
    }

    if (Number(this.txtAmount.nativeElement.value) > WebResponseService.settings.transaction_amount_limit) {
      this.util.dialog(WebResponseService.messages.msg_err_less_amount.heading, WebResponseService.messages.msg_err_less_amount.message.replace("{amount}", WebResponseService.settings.transaction_amount_limit), ApplicationData.dialogType._MESSAGE, ApplicationData.dialogIcon._WARNING, res => {

      });
      return;
    }

  
    else if (this.selectedPurpose_id == undefined || this.selectedPurpose_id == 0 ) {
      this.util.dialog(WebResponseService.messages.err_transaction_purpose.message, "", ApplicationData.dialogType._MESSAGE, ApplicationData.dialogIcon._WARNING, res => {

      });
      return;
    }



    else {

      setTimeout(() => {
        this.dataService.subject.next("Entered Account#: " + this.masking.transform(this.txtAccount.nativeElement.value));
      }, 0); // Execute immediately
      
      setTimeout(() => {
        this.dataService.subject.next("Entered Mobile#: " + this.masking.transform(this.txtMobile.nativeElement.value));
      }, 200); // 200ms delay
      
      setTimeout(() => {
        this.dataService.subject.next("Entered Amount#: " + this.txtAmount.nativeElement.value);
      }, 400); // 400ms delay
      
      setAccountNumber(this.txtAccount.nativeElement.value);
      setMobileNumber(this.txtMobile.nativeElement.value);
      setTransactionPurposeId(this.selectedPurpose_id);
      setEnteredAmount(this.txtAmount.nativeElement.value);
      if (ApplicationData.sessionTransaction.depositMethod == ApplicationData.depositMethods._CHEQUE) {
        sessionStorage.setItem("currentAmount", this.txtAmount.nativeElement.value);
      }
      //   setTransactionPurposeText(this.purposeOptions[this.purposeOptions.findIndex((x: { id: number; }) => x.id === Number(this.selectedPurpose_id))].purpose);
      console.log("fetchAccountTitle 237");
      this.fetchAccountTitle();

    }

  }


  typeNumeric(character: any) {
    let inputField;
    switch (this.selectedField) {
      // case "account":
      //   // inputField = this.txtAccount.nativeElement;
      //   // Don't allow User to enter account number through On screen Numpad
      //   break;
      case "mobile":
        inputField = this.txtMobile.nativeElement;
        break;
      case "amount":
        inputField = this.txtAmount.nativeElement;
        break;

      default:
        this.selectedField = "mobile";
        // console.error(`Unexpected selectedField: ${this.selectedField}`);
        inputField = this.txtMobile.nativeElement;
        break;
    }

    if (!inputField) {
      console.error('No valid input field found for selectedField:', this.selectedField);
      return;
    }

    if (character == "D") {
      inputField.value = inputField.value.slice(0, -1);
    }
    else if (character == "C") {
      inputField.value = "";
    }
    else {
      if (this.selectedField == "mobile") {
        if (inputField.value.length == 12) {
          return;
        }

        if (inputField.value.length == 0 && character != "0") {
          return;
        }

        if (inputField.value.length == 1 && character != "3") {
          return;
        }

        if (inputField.value.length == 4) {
          inputField.value += "-";
        }
      }

      // if (inputField.id == "account") {
      //   if (inputField.value.length == 14) { //ACCOUNT NUMBER LIMIT
      //     return;
      //   }
      // }
      // Handle input for the amount field
      if (this.selectedField == "amount") {
        // Prevent leading zero in the amount field
        if (inputField.value.length == 0 && character == "0") {
            return;
        }

        // Process cash deposit logic
        if (getDepositMethod() == ApplicationData.depositMethods._CASH) {
            if (Number(inputField.value + character) % 10 === 0) {
                this.multipleOfDenomError = false;
            } else {
                this.multipleOfDenomError = true;
            }

            // Check if the amount exceeds the transaction limit
            if (Number(inputField.value + character) > WebResponseService.settings.transaction_amount_limit) {
                this.exceedAmount = true;
            } else {
                this.exceedAmount = false;
            }
        }
    }

    inputField.value += character; // Append the character to the input field
    }
  }


  toggleAccountList() {
    this.isFlippedaccount = !this.isFlippedaccount;

    document.querySelector(".account-list-wrapper")?.classList.toggle("open");
    document.querySelector(".account-list-wrapper")?.classList.toggle("close");
  }

  selectAccount(accountNo: string) {
    this.selectedAccountNo = accountNo;
    this.txtAccount.nativeElement.value = accountNo;
    this.toggleAccountList(); // Close the dropdown after selection
  }

  ngAfterViewInit(): void {
    if (getAccountNumber() != "") {
      this.txtAccount.nativeElement.value = getAccountNumber();
    }
    this.fetchOwnAccountsList(); // Fetch the accounts list on component initialization
  }

  fetchOwnAccountsList() {
    const cnicValue = ApplicationData.customer.CNIC;
    console.log("CNIC Value:", cnicValue); // Log the CNIC value
    this.apiResponse.getOwnAccountsList(cnicValue).subscribe((res: any) => {
        console.log("Accounts List Response:", res);
        if (res.statusCode == '00') {
            this.accountsList = res.data;
            // Log each account number
            this.accountsList.forEach(account => {
              const maskedAccountNumber = this.masking.transform(account.accountNo);
              console.log("Account Number:", maskedAccountNumber);  
              this.dataService.subject.next("Account Numbers Fetched Against CNIC:" + maskedAccountNumber);            
            });
            this.cdr.detectChanges(); // Manually trigger change detection
        } else if (res.statusCode == '01') {
            this.util.dialog(
                "Sorry!",
                "No accounts found for your CNIC. Please verify your CNIC or consider making a cash deposit to other account.",
                ApplicationData.dialogType._MESSAGE,
                ApplicationData.dialogIcon._ERROR,
                (res: any) => {
                    this.dataService.pushCancelTransaction();
                }
            );
        } else {
            this.util.dialog(
                "Error",
                "There is an error please try again later",
                ApplicationData.dialogType._MESSAGE,
                ApplicationData.dialogIcon._ERROR,
                (res: any) => {
                  this.dataService.pushCancelTransaction();
              }
            );
        }
    }, (err: any) => {
        console.error("Error fetching accounts list", err);
        this.util.dialog(
            "Error",
            "Failed to fetch accounts list",
            ApplicationData.dialogType._MESSAGE,
            ApplicationData.dialogIcon._ERROR,
            (res: any) => {
              this.dataService.pushCancelTransaction('failed');
          }
        );
    });
  }


}
