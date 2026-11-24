import { Component, ElementRef, EventEmitter, Output, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { MaskPipe } from 'src/app/Pipes/Maskings';
import { AppComponent } from 'src/app/app.component';
import { DataService } from 'src/app/classes/DataService';
import { Initializer } from 'src/app/classes/Initializer';
import { MockService } from 'src/app/classes/MockService/mock-service.service';
import { ApplicationData } from 'src/app/classes/application';
import { WebResponseService } from 'src/app/web-response.service';
import { setTransactionData } from 'src/app/classes/GlobalFunctions';
import { getAccountNumber, setAccountNumber, setMobileNumber, getMobileNumber, checkSpecificDeviceHealth } from 'src/app/classes/GlobalFunctions';
import { getbillingCategory, getbillingCompanyCode, getbillingCompanyId, getbillingCompanyName } from 'src/app/classes/GlobalFunctions';

@Component({
  selector: 'app-ubp-transaction-input',
  templateUrl: './ubp-transaction-input.component.html',
  styleUrls: ['./ubp-transaction-input.component.css']
})
export class UbpTransactionInputComponent implements OnInit, AfterViewInit {

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

  billDetail: any;
  isBillPayment: boolean = true;
  billingCompany: any = {
    companyType: '',
    companyCode: '',
    companyName: '',
    companyLogoPath: ''
  };

  billingCategory: string; // Declare billingCategory property

  constructor(
    private _router: Router,
    private apiResponse: WebResponseService,
    private mock: MockService,
    private masking: MaskPipe,
    private initService: Initializer,
    private util: AppComponent,
    private dataService: DataService
  ) {
    this.initService.startMonitoring();
    this.purposeOptions = ApplicationData.sessionTransaction.transactionPurposeList;
  }

  ngOnInit(): void {
    this.fetchBillingCompanyDetails();
  }

  ngAfterViewInit(): void {
    // Retain account number
    if (getAccountNumber() != "") {
      this.txtAccount.nativeElement.value = getAccountNumber();
    }
  
    // Retain mobile number
    if (getMobileNumber() != "") {
      this.txtMobile.nativeElement.value = getMobileNumber();
    }
  }

  fetchBillingCompanyDetails() {
    this.apiResponse.getBillingCompanies().subscribe((data) => {
      this.billingCompany = data;

      // Using get methods to fetch company code, name, and id
      this.billingCompany.companyCode = getbillingCompanyCode();
      this.billingCompany.companyName = getbillingCompanyName();
      this.billingCompany.companyId = getbillingCompanyId();

      console.log('Billing Company Data:', this.billingCompany);
      console.log('Company Code:', this.billingCompany.companyCode);
      console.log('Company Name:', this.billingCompany.companyName);
      console.log('Company Id:', this.billingCompany.companyId);

      this.billingCategory = getbillingCategory();
      console.log('Billing Category:', this.billingCategory);
    });
  }

  continueTransaction() {
    if (checkSpecificDeviceHealth("Cash Acceptor") !== "OK") {
      this.util.dialog(WebResponseService.messages.msg_err_proc_req.heading, WebResponseService.messages.msg_err_proc_req.message, ApplicationData.dialogType._MESSAGE, ApplicationData.dialogIcon._ERROR, res => {
        this.componentResult.emit("canceltxn");
      });
      return;
    }

    this.initService.stopMonitoring();

    if (checkSpecificDeviceHealth("Receipt Printer") !== "OK") {
      this.util.dialog(WebResponseService.messages.msg_receipt_unavailable.heading, WebResponseService.messages.msg_receipt_unavailable.message, ApplicationData.dialogType._CONFIRMATION, ApplicationData.dialogIcon._WARNING, result => {
        if (result) {
          ApplicationData.sessionTransaction.skippingReceipt = true;
          // this.fetchAccountTitle();
          this.fetchBillingDetails();
        } else {
          this.componentResult.emit("canceltxn");
        }
      });
    } else {
      this.util.spinnerStop();
      // this.fetchAccountTitle();
      this.fetchBillingDetails();
    }
  }

  errorDialog(title: string, message: string): void {
    this.util.dialog(title, message, ApplicationData.dialogType._MESSAGE, ApplicationData.dialogIcon._ERROR, res => {
      // Optional: Handle dialog callback if needed
    });
  }

  cancelTransaction() {
    this.dataService.pushCancelTransaction("customer");
  }

  focusField(object: any) {
    this.selectedField = object;
  }

  proceed() {
    console.log(this.selectedPurpose_id);
    if (this.multipleOfDenomError) {
      this.util.dialog(WebResponseService.messages.msg_multiple_tens.heading, WebResponseService.messages.msg_multiple_tens.message, ApplicationData.dialogType._MESSAGE, ApplicationData.dialogIcon._ERROR, res => {

      });
      return;
    }

    if (this.txtAccount.nativeElement.value.length < 5) {
      this.util.dialog(WebResponseService.messages.valid_consumer_num.message, "", ApplicationData.dialogType._MESSAGE, ApplicationData.dialogIcon._WARNING, res => {

      });
      return;
    }

    if (this.txtMobile.nativeElement.value.length !== 12) {
      this.util.dialog(WebResponseService.messages.err_mobile_num.message, "", ApplicationData.dialogType._MESSAGE, ApplicationData.dialogIcon._WARNING, res => {

      });
      return;
    } else {
    //  this.dataService.subject.next("Entered Account/Consumer#: " +  this.masking.transform ( this.txtAccount.nativeElement.value));
    //  this.dataService.subject.next("Entered Mobile#: " + this.masking.transform ( this.txtMobile.nativeElement.value));

    // Mask account/consumer number if length is less than 8
    let accountValue = this.txtAccount.nativeElement.value;
    let maskedAccountValue = accountValue;

    if (accountValue.length < 8) {
      const middleStart = Math.floor(accountValue.length / 3);
      const middleEnd = middleStart + 3;
      maskedAccountValue = accountValue.substring(0, middleStart) + '***' + accountValue.substring(middleEnd);
    } else {
      maskedAccountValue = this.masking.transform(accountValue);
    }

    // Mask mobile number with regular masking
    let mobileValue = this.txtMobile.nativeElement.value;
    let maskedMobileValue = this.masking.transform(mobileValue);

    // Send the masked values to the subject
    // this.dataService.subject.next("Entered Account/Consumer#: " + maskedAccountValue);
    // this.dataService.subject.next("Entered Mobile#: " + maskedMobileValue);
    this.dataService.subject.next("Entered Account/Consumer#: " + maskedAccountValue);
    setTimeout(() => {
      this.dataService.subject.next("Entered Mobile#: " + maskedMobileValue);
    }, 1000); // 1000 milliseconds = 1 second

      setAccountNumber(this.txtAccount.nativeElement.value);
      setMobileNumber(this.txtMobile.nativeElement.value);
      if (ApplicationData.sessionTransaction.depositMethod === ApplicationData.depositMethods._CHEQUE) {
        sessionStorage.setItem("currentAmount", this.txtAmount.nativeElement.value);
      }

      // this.fetchAccountTitle();
      this.fetchBillingDetails();
    }
  }

  fetchBillingDetails() {
    this.util.spinnerStart('Fetching bill and account details...');
    this.fetchAccountAttempts++;
  
    this.apiResponse.getBillDetail(this.billingCompany).subscribe(
      (res) => {
        this.initService.startMonitoring();
        this.util.spinnerStop();
  
        if (res['statusCode'] === '00') {
          this.billDetail = res['data'];
          console.log('Bill details fetched:', this.billDetail); // Log the bill details here
  
          // Assign consumerTitle from bill details to accountTitle
          ApplicationData.sessionTransaction.accountTitle = this.billDetail.consumerTitle;
          // this.dataService.subject.next("Account Title Fetched:" + ApplicationData.sessionTransaction.accountTitle);
          // this.dataService.subject.next("Bill Amount:" + this.billDetail.amount);

          setTimeout(() => {
            this.dataService.subject.next("Account Title Fetched:" + ApplicationData.sessionTransaction.accountTitle);
            setTimeout(() => {
              this.dataService.subject.next("Bill Amount:" + this.billDetail.amount);
            }, 2000); // 1 second after the first one
          }, 3000); // initial 2-second delay
  
          setTransactionData(res['data']);
          this.componentResult.emit(2); // Emitting component result after successful bill detail fetch
          this.componentResult.emit({ step: true });
  
        } else if (res['statusCode'] === '01') {
          console.log('No bill found for the entered consumer number:', res); // Log the response
  
          this.util.dialog("No Bill Found", "The entered consumer number has no bill on it.", ApplicationData.dialogType._MESSAGE, ApplicationData.dialogIcon._WARNING, (dialogRes) => {
            this.dataService.subject.next("No Bill Found");
          });
  
        } else {
          console.error('Error fetching bill details:', res); // Log any other error response
  
          this.util.dialog("Error", "Error fetching bill details. Please try again.", ApplicationData.dialogType._MESSAGE, ApplicationData.dialogIcon._ERROR, (dialogRes) => {
            this.dataService.subject.next("Error Fetching Bill Details");
          });
        }
      },
      (error) => {
        console.error('Error fetching bill details:', error); // Handle error case
        this.util.spinnerStop();
  
        this.util.dialog("Error", "Error fetching bill details. Please try again.", ApplicationData.dialogType._MESSAGE, ApplicationData.dialogIcon._ERROR, (dialogRes) => {
          this.dataService.subject.next("Error Fetching Bill Details");
        });
      }
    );
  }
  

  typeNumeric(character: any) {
    let inputField;

    switch (this.selectedField) {
      case "account":
        inputField = this.txtAccount.nativeElement;
        break;
      case "mobile":
        inputField = this.txtMobile.nativeElement;
        break;
      default:
        inputField = this.txtAccount.nativeElement;
        this.selectedField = "account";
        break;
    }

    if (character == "D") {
      inputField.value = inputField.value.slice(0, -1);
    } else if (character == "C") {
      inputField.value = "";
    } else {
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

      inputField.value += character;
    }
  }
}
