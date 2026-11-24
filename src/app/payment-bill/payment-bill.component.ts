import { Component, EventEmitter, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { SwiperOptions } from 'swiper';
import { clearTransactionSession, getTransactiontTitle, setAccountNumber, setMobileNumber, setTransactionData } from '../classes/GlobalFunctions';
import { ConfirmDialogComponent, ConfirmDialogModel } from '../dialogs/confirm-dialog/confirm-dialog.component';
import { WebResponseService } from '../web-response.service';

import { ApplicationData } from '../classes/application';

import { DataService } from '../classes/DataService';
import { MaskPipe } from '../Pipes/Maskings';

@Component({
  selector: 'app-payment-bill',
  templateUrl: '../../assets/htmls/payment-bill.component.html',
  styleUrls: ['./payment-bill.component.css']
})
export class PaymentBillComponent {


  selectedField = "";
  transactionsSwiper: SwiperOptions = {
    spaceBetween: 20,
    pagination: false,
    scrollbar: { draggable: true },
  };

  result: any;
  billingCompanies: any;
  selectedCompany = {
    id: "",
    name: "NA",
    code: ""
  };

  input_accountNum: any = "";
  input_mobile: any = "";
  componentLabeling: any;
  form_direction: any;

  slidesCount: number = 0;
  iconsHTML: any;
  iconIndex: number = 0;
  tableone: any = "<h1>table 1</h1>";
  tabletwo: any = "<h1>table 2</h1>";
  billDetail: any;
  companyTypes: any;
  filteredCompaines: any;
  transationLabel: any;

  @Output() innerSteps = new EventEmitter<any>();
  @Output() componentResult = new EventEmitter<any>();

  isTopupTransaction: boolean = false;


  renderSwiper(slideIndex: number) {
    this.iconIndex = slideIndex * 10;
    this.iconsHTML = "";
    for (let j = 0; j < 2; j++) {
      this.iconsHTML += "<tr>";
      for (let k = 0; k < 5; k++) {
        if (this.iconIndex <= this.billingCompanies.length) {
          this.iconsHTML += "<td (click)='selectCompany(" + this.iconIndex + ")'>";
          this.iconsHTML += "<img src='http://192.168.0.251:3645" + this.billingCompanies[this.iconIndex].companyLogoPath + "' />";
          this.iconsHTML += "</td>";
          this.iconIndex = this.iconIndex + 1;
        }
      }
      this.iconsHTML += "</tr>";
    }
    //  this.iconsHTML += "</table>";
    return this.iconsHTML;
  }

  constructor(private apiResponse: WebResponseService, private _router: Router, public dialog: MatDialog, private ejService: DataService, private masking: MaskPipe) {



    this.componentLabeling = ApplicationData.labeling.transaction_bill_payment;
    this.form_direction = ApplicationData.labeling.localization.settings.direction;

    this.isTopupTransaction = getTransactiontTitle() == "Mobile Topup" ? true : false;
    this.apiResponse.getBillingCompanies().subscribe(res => {
      this.billingCompanies = res['data'];
      if (this.isTopupTransaction) {
        this.selectCategory("Topup");
      }
      this.companyTypes = [...new Set(this.billingCompanies.map(company => company.companyType))];
      this.slidesCount = Math.round(this.billingCompanies.length / 10);
      //console.log(this.renderSwiper(1));
      // if (ApplicationData.sessionTransaction.accountNumber != "") {
      //   this.input_accountNum = ApplicationData.sessionTransaction.accountNumber;
      // }
      // if (ApplicationData.sessionTransaction.mobileNumber != "") {
      //   this.input_mobile = ApplicationData.sessionTransaction.mobileNumber;
      // }

    })

  }




  selectCompany(company: any) {
    // this.selectedCompany.id = this.billingCompanies[index].companyId;
    // this.selectedCompany.name = this.billingCompanies[index].companyName;
    // this.selectedCompany.code = this.billingCompanies[index].companyCode;
    ApplicationData.sessionTransaction.company.id = company.companyId;
    ApplicationData.sessionTransaction.company.code = company.companyCode;
    setTimeout(() => {
      this.componentResult.emit(company);
    }, 500);

  }

  selectCategory(categroy: any) {
    setTimeout(() => {
      this.filteredCompaines = this.billingCompanies.filter(company => company.companyType === categroy);
      this.innerSteps.emit(1);
    }, 500);

  }

  cancelTransaction() {
    const dialogData = new ConfirmDialogModel(WebResponseService.messages.confirm_cancel_transaction.heading, WebResponseService.messages.confirm_cancel_transaction.message, true);
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "600",
      data: dialogData
    });

    dialogRef.disableClose = true;
    dialogRef.afterClosed().subscribe(dialogResult => {
      this.result = dialogResult;

      if (this.result == true) {
        this.apiResponse.TWARE_endTransaction().subscribe(async (data: any) => {
        });
        sessionStorage.removeItem("TWARE_transactionId");
        clearTransactionSession();
        this._router.navigate(['home']);
      }
    });
  }

  nextScreen() {

    if (this.selectedCompany.name == "NA") {
      const dialogData = new ConfirmDialogModel(WebResponseService.messages.err_select_biller.heading, WebResponseService.messages.err_select_biller.message, false);
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        maxWidth: "600",
        data: dialogData
      });

      return;
    }
    else if (this.input_accountNum == "") {
      const dialogData = new ConfirmDialogModel(WebResponseService.messages.err_empty_biller.heading, WebResponseService.messages.err_empty_biller.message, false);
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        maxWidth: "600",
        data: dialogData
      });

      return;
    }

    else if (this.input_mobile.length != 12) {
      const dialogData = new ConfirmDialogModel(WebResponseService.messages.err_mobile_num.heading, WebResponseService.messages.err_mobile_num.message, false);
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        maxWidth: "600",
        data: dialogData
      });
    }

    else {
      setAccountNumber(this.input_accountNum);
      setMobileNumber(this.input_mobile);
      // this.ejService.subject.next("Entered Account#: " + this.masking.transform(this.input_accountNum));
      // this.ejService.subject.next("Entered Mobile#: " + this.masking.transform(this.input_mobile));
      // this.ejService.subject.next("Opening TWare Transaction");
      this.apiResponse.TWARE_startTransaction("","").subscribe((startTransactionResponse: any) => {
        if (startTransactionResponse["code"] == "0000") {
          sessionStorage.setItem("TWARE_transactionId", startTransactionResponse["data"]["transactionId"]);
          this.ejService.subject.next("Fetching Bill Details");
          this.apiResponse.getBillDetail(this.selectedCompany).subscribe(res => {
            this.billDetail = res;
            console.log("Fetched Bill");
            console.log(this.billDetail);
            if (this.billDetail != null && this.billDetail['statusCode'] == "00") {
              if (this.billDetail.data.status == "Paid") {
                const dialogData = new ConfirmDialogModel("Information", "This bill has been already paid.", false);
                const dialogRef = this.dialog.open(ConfirmDialogComponent, {
                  maxWidth: "600",
                  data: dialogData
                });
              }
              else {
                setTransactionData(res['data']);
                this._router.navigate(['transaction-review']);
              }

            }
            else {
              const dialogData = new ConfirmDialogModel("Invalid Consumer #", "Unable to fetch bill details, pelase provide valid consumer number", false);
              const dialogRef = this.dialog.open(ConfirmDialogComponent, {
                maxWidth: "600",
                data: dialogData
              });
            }
          }, err => {
            this.ejService.subject.next("Error while fetching bill details");
          });
        }
      }, err => {
        this.ejService.subject.next("Error while opening tware transaction file");
      });



    }

  }

  public stepback() {
    this.innerSteps.emit(0);
    this.filteredCompaines = null;
  }


}
