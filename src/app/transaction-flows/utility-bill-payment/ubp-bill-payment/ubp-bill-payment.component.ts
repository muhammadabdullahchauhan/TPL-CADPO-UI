import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { getTransactiontTitle, } from 'src/app/classes/GlobalFunctions';
import { Router } from '@angular/router';
import { MaskPipe } from 'src/app/Pipes/Maskings';
import { AppComponent } from 'src/app/app.component';
import { DataService } from 'src/app/classes/DataService';
import { Initializer } from 'src/app/classes/Initializer';
import { ApplicationData } from 'src/app/classes/application';
import { WebResponseService } from 'src/app/web-response.service';
import { setbillingCategory, setbillingCompanyCode, setbillingCompanyName, setbillingCompanyId, setOuterSteps } from 'src/app/classes/GlobalFunctions';

@Component({
  selector: 'app-ubp-bill-payment',
  templateUrl: './ubp-bill-payment.component.html',
  styleUrls: ['./ubp-bill-payment.component.css']
})
export class UbpBillPaymentComponent implements OnInit{
  billingCompanies: any;
  selectedCompany = {
    companyId: "",
    companyName: "NA",
    companyCode: "",
    companyType: ""  // Add companyType here
  };
  selectedCategory: string = ''; // Track selected billing category
  componentLabeling: any;
  form_direction: any;
  slidesCount: number = 0;
  billDetail: any;
  companyTypes: any;
  filteredCompaines: any;
  filteredCompainesProviding: boolean = false;
  componentStep = 0;

  @Output() innerSteps = new EventEmitter<number>();
  @Output() componentResult = new EventEmitter<any>();

  isTopupTransaction: boolean = false;
  proceedCompleted: boolean = false;

  constructor(
    private apiResponse: WebResponseService,
    private _router: Router,
    private util: AppComponent,
    private initService: Initializer,
    public dialog: MatDialog,

    private masking: MaskPipe,
    private dataService: DataService
  ) {
    this.componentLabeling = ApplicationData.labeling.transaction_bill_payment;
    this.form_direction = ApplicationData.labeling.localization.settings.direction;

    this.isTopupTransaction = getTransactiontTitle() == "Mobile Topup";
    this.apiResponse.getBillingCompanies().subscribe(res => {
      this.billingCompanies = res['data'];
      if (this.isTopupTransaction) {
        this.selectCategory("Topup");
      }
      this.companyTypes = [...new Set(this.billingCompanies.map(company => company.companyType))];
      this.slidesCount = Math.ceil(this.billingCompanies.length / 10);

      this.initService.startMonitoring();
    });




    // this.apiResponse.getBillingCompanies().subscribe(
    //   res => {
    //     if (res["statusCode"] == "00") {
    //       this.billingCompanies = res['data'];
    //       if (this.isTopupTransaction) {
    //         this.selectCategory("Topup");
    //       }
    //       this.companyTypes = [...new Set(this.billingCompanies.map(company => company.companyType))];
    //       this.slidesCount = Math.ceil(this.billingCompanies.length / 10);
    //     } else {
    //       this.util.dialog(
    //         "Sorry!",
    //         "Your transaction cannot be processed at the moment, please try again later",
    //         ApplicationData.dialogType._MESSAGE,
    //         ApplicationData.dialogIcon._ERROR,
    //         (res: any) => {
    //           this.dataService.pushCancelTransaction();
    //         }
    //       );
    //     }
    //     this.initService.startMonitoring();
    //   },
    //   error => {
    //     console.error('Error fetching billing companies:', error);
    //   }
    // );
    
  }

  ngOnInit() {
    // Retrieve the previously selected company and category from session storage
    const storedCompany = sessionStorage.getItem('selectedCompany');
    const storedCategory = sessionStorage.getItem('selectedCategory');
    
    if (storedCompany) {
      this.selectedCompany = JSON.parse(storedCompany);
      this.filteredCompaines = this.billingCompanies?.filter(c => c.companyType === this.selectedCompany.companyType);
    }

    if (storedCategory) {
      this.selectedCategory = storedCategory;
    }
  }


  selectCompany(company: any) {
    this.selectedCompany = company;

     this.selectedCompany = company;
    sessionStorage.setItem('selectedCompany', JSON.stringify(company)); // Store selected company in session storage

    console.log('Selected Company:', this.selectedCompany);

    console.log('Selected Company:', this.selectedCompany);
    console.log('Selected Company Code:', this.selectedCompany.companyCode);
    console.log('Selected Company Name:', this.selectedCompany.companyName);
    console.log('Selected Company Name:', this.selectedCompany.companyId);
  }

  emitComponentResult(): void {
    console.log('Emitting component result:', {
      selectedCategory: this.selectedCategory,
    });


    


    this.componentResult.emit({
      selectedCategory: this.selectedCategory,
    });
  }

  selectCategory(category: any) {
    this.selectedCategory = category; // Set selected category

     // Store selected category in session storage
     sessionStorage.setItem('selectedCategory', category);

    // Emit the selected category result
    this.emitComponentResult();

    console.log('Selected Billing Category:', this.selectedCategory);
  }

  goToNextStep(): boolean {
    if (!this.selectedCategory) {
      this.util.dialog(
        "Error", 
        "Please select a billing category in order to proceed", 
        ApplicationData.dialogType._MESSAGE, 
        ApplicationData.dialogIcon._WARNING, 
        res => {}
      );
      console.error('Error: Please select a billing category.');
      return false;  // No category selected, stop here
    }
  
    // Proceed to the next step if a category is selected
    this.filteredCompaines = this.billingCompanies.filter(
      company => company.companyType === this.selectedCategory
    );
    setOuterSteps(1); // Set outer steps
    this.innerSteps.emit(this.componentStep);
    setbillingCategory(this.selectedCategory); // Set billing category
    
    return true;  // Success
  }
  

  proceed(): boolean {
    if (this.selectedCompany.companyName === "NA") {
      this.util.dialog("Error", "Please select a billing company in order to proceed", ApplicationData.dialogType._MESSAGE, ApplicationData.dialogIcon._WARNING, res => { });
      console.error('Error: Please select a billing company.');
      return false;
    }

    // Set billing company code, name, and ID using functions from GlobalFunctions
    setbillingCompanyCode(this.selectedCompany.companyCode);
    console.log('Set billing company code:', this.selectedCompany.companyCode);

    setbillingCompanyName(this.selectedCompany.companyName);
    console.log('Set billing company name:', this.selectedCompany.companyName);

    setbillingCompanyId(this.selectedCompany.companyId);
    console.log('Set billing company ID:', this.selectedCompany.companyId);

    this.dataService.subject.next("biller company: " + this.selectedCompany.companyName);
    // Proceed with API call
    this.proceedCompleted = true;
    return true; // Assuming all checks pass initially
  }

  isFilteredCompaniesprovided(): boolean {
    return this.filteredCompainesProviding = true; // Returns true if filteredCompaines is not null or undefined
  }

  stepback(): void {
    // Decrement componentStep and emit inner step event
    this.componentStep = Math.max(0, this.componentStep - 1); // Ensure componentStep doesn't go below 0
    this.innerSteps.emit(this.componentStep);
    this.filteredCompaines = null;
    this.proceedCompleted = false; // Reset proceed flag when stepping back
  }
}
