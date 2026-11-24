import { Component, ElementRef, EventEmitter, Output, ViewChild, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MaskPipe } from 'src/app/Pipes/Maskings';
import { AppComponent } from 'src/app/app.component';
import { DataService } from 'src/app/classes/DataService';
import { Initializer } from 'src/app/classes/Initializer';
import { MockService } from 'src/app/classes/MockService/mock-service.service';
import { ApplicationData } from 'src/app/classes/application';
import { WebResponseService } from 'src/app/web-response.service';
import { setEnteredAmount, setMobileNumber, checkSpecificDeviceHealth} from 'src/app/classes/GlobalFunctions';
import { getbillingCategory, getbillingCompanyCode, getbillingCompanyId, getbillingCompanyName } from 'src/app/classes/GlobalFunctions';

@Component({
  selector: 'app-mt-transaction-input',
  templateUrl: './mt-transaction-input.component.html',
  styleUrls: ['./mt-transaction-input.component.css']
})
export class MtTransactionInputComponent implements OnInit {

  purposeOptions: any;
  selectedPurpose_id: any;
  selectedField: any;

  @ViewChild('inputAmount') txtAmount: ElementRef;
  @ViewChild('inputMobile') txtMobile: ElementRef;
  @Output() componentResult = new EventEmitter<any>();
  currentAccountInputIndex = 0;
  multipleOfDenomError: boolean = false;
  exceedAmount: boolean = false;

  billDetail: any;
  isBillPayment: boolean = true;
  topupCompany: any = {
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
    this.fetchtopupCompanyDetails();
  }

  fetchtopupCompanyDetails() {
    // this.apiResponse.getBillingCompanies().subscribe((data) => {
      // this.topupCompany = data;

      // Using get methods to fetch company code, name, and id
      this.topupCompany.companyCode = getbillingCompanyCode();
      this.topupCompany.companyName = getbillingCompanyName();
      this.topupCompany.companyId = getbillingCompanyId();

      console.log('Topup Company Data:', this.topupCompany);
      console.log('Company Code:', this.topupCompany.companyCode);
      console.log('Company Name:', this.topupCompany.companyName);
      console.log('Company Id:', this.topupCompany.companyId);

      this.billingCategory = getbillingCategory();
      console.log('Billing Category:', this.billingCategory);

      
    // });
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
        } else {
          this.componentResult.emit("canceltxn");
        }
      });
    } else {
      this.util.spinnerStop();
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
      this.util.dialog(
        WebResponseService.messages.msg_multiple_tens.heading,
        WebResponseService.messages.msg_multiple_tens.message,
        ApplicationData.dialogType._MESSAGE,
        ApplicationData.dialogIcon._ERROR,
        res => {}
      );
      return;
    }
  
    const enteredAmount = Number(this.txtAmount.nativeElement.value);
    if (enteredAmount <= 0) {
      this.util.dialog(
        WebResponseService.messages.msg_err_enter_amount.message,
        "",
        ApplicationData.dialogType._MESSAGE,
        ApplicationData.dialogIcon._WARNING,
        res => {}
      );
      return;
    }
  
    // Amount divisible by 10 check (optional)
    if (enteredAmount % 10 !== 0) {
      this.util.dialog(
        "Amount Error",
        "The entered amount must be divisible by 10.",
        ApplicationData.dialogType._MESSAGE,
        ApplicationData.dialogIcon._WARNING,
        res => {}
      );
      return;
    }
    
  
    const mobileNumber = this.txtMobile.nativeElement.value;
    if (mobileNumber.length !== 12) {
      this.util.dialog(
        WebResponseService.messages.err_mobile_num.message,
        "",
        ApplicationData.dialogType._MESSAGE,
        ApplicationData.dialogIcon._WARNING,
        res => {}
      );
      return;
    }
  
    setEnteredAmount(enteredAmount);
    setMobileNumber(mobileNumber);
    
    if (ApplicationData.sessionTransaction.depositMethod === ApplicationData.depositMethods._CHEQUE) {
      sessionStorage.setItem("currentAmount", enteredAmount.toString());
    }
  
    // Emit events after all checks and assignments are done
    this.componentResult.emit(2);
    this.componentResult.emit({ step: true });
  }
  

  typeNumeric(character: any) {
    let inputField;

    switch (this.selectedField) {
      case "amount":
        inputField = this.txtAmount.nativeElement;
        break;
      case "mobile":
        inputField = this.txtMobile.nativeElement;
        break;
      default:
        inputField = this.txtAmount.nativeElement;
        this.selectedField = "amount";
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

