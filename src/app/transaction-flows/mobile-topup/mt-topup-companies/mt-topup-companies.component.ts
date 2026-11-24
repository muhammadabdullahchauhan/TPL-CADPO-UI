import { Component, EventEmitter, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MaskPipe } from 'src/app/Pipes/Maskings';
import { AppComponent } from 'src/app/app.component';
import { DataService } from 'src/app/classes/DataService';
import { Initializer } from 'src/app/classes/Initializer';
import { ApplicationData } from 'src/app/classes/application';
import { WebResponseService } from 'src/app/web-response.service';
import { setbillingCompanyCode, setbillingCompanyName, setbillingCompanyId, getTransactiontTitle, setbillingCategory } from 'src/app/classes/GlobalFunctions';

@Component({
  selector: 'app-mt-topup-companies',
  templateUrl: './mt-topup-companies.component.html',
  styleUrls: ['./mt-topup-companies.component.css']
})
export class MtTopupCompaniesComponent {
  @Output() innerSteps = new EventEmitter<any>();
  @Output() componentResult = new EventEmitter<any>();
  companiesData: any;
  networkProviders: any;
  selectedCompany = {
    companyId: "",
    companyName: "NA",
    companyCode: ""
  };

  proceedCompleted: boolean = false;
  isTopupTransaction: boolean = true;

  constructor(
    private apiResponse: WebResponseService,
    private _router: Router,
    private util: AppComponent,
    private initService: Initializer,
    public dialog: MatDialog,
    private masking: MaskPipe,
    private dataService: DataService
  ) {
      // Set the billing category to "Mobile Topup"
    setbillingCategory("Mobile Topup");
    this.isTopupTransaction = getTransactiontTitle() == "Mobile Topup";
    this.apiResponse.getBillingCompanies().subscribe(res => {
      console.log(res);
      this.companiesData = res['data'];
      this.networkProviders = this.companiesData.filter(company => company.companyType === "Topup");
    });
  }

  selectCompany(company: any) {
    this.selectedCompany = company;
    console.log('Selected Company:', this.selectedCompany);
    console.log('Selected Company Code:', this.selectedCompany.companyCode);
    console.log('Selected Company Name:', this.selectedCompany.companyName);
    console.log('Selected Company ID:', this.selectedCompany.companyId);

    ApplicationData.sessionTransaction.company.id = company.companyId;
    ApplicationData.sessionTransaction.company.code = company.companyCode;
    this.innerSteps.emit(1);
    setTimeout(() => {
      this.componentResult.emit(company);
    }, 500);
  }

  proceed(): boolean {
    if (this.selectedCompany.companyName === "NA") {
      this.util.dialog(
        "Error",
        "Please select a network provider in order to proceed",
        ApplicationData.dialogType._MESSAGE,
        ApplicationData.dialogIcon._WARNING,
        res => { }
      );
      console.error('Error: Please select a billing company.');
      return false;
    }

    setbillingCompanyCode(this.selectedCompany.companyCode);
    console.log('Set topup company code:', this.selectedCompany.companyCode);

    setbillingCompanyName(this.selectedCompany.companyName);
    console.log('Set topup company name:', this.selectedCompany.companyName);

    setbillingCompanyId(this.selectedCompany.companyId);
    console.log('Set topup company ID:', this.selectedCompany.companyId);

    this.dataService.subject.next("biller company: " + this.selectedCompany.companyName);
    this.proceedCompleted = true;
    return true;
  }
}
