import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MaskPipe } from 'src/app/Pipes/Maskings';
import { AppComponent } from 'src/app/app.component';
import { DataService } from 'src/app/classes/DataService';
import { Initializer } from 'src/app/classes/Initializer';
import { ApplicationData } from 'src/app/classes/application';
import { WebResponseService } from 'src/app/web-response.service';
import { setbankName, setbankCode, setbankId, setOuterSteps, setbankIMD } from 'src/app/classes/GlobalFunctions';

@Component({
  selector: 'app-cd-other-banks-selection',
  templateUrl: './cd-other-banks-selection.component.html',
  styleUrls: ['./cd-other-banks-selection.component.css']
})
export class CdOtherBanksSelectionComponent implements OnInit {
  banks: any;// Initialize as an empty array
  selectedBank = {
    bankId: "",
    bankIMD: "",
    bankName: "",
    bankCode: "",
    bankType: "" // Add bankType here
  };
  selectedCategory: string = ''; // Track selected bank category
  bankTypes: any;
  filteredBanks: any;
  componentStep = 0;

  @Output() innerSteps = new EventEmitter<number>();
  @Output() componentResult = new EventEmitter<any>();

  constructor(
    private apiResponse: WebResponseService,
    private _router: Router,
    private util: AppComponent,
    private initService: Initializer,
    public dialog: MatDialog,
    private masking: MaskPipe,
    private dataService: DataService
  ) {
    // this.loadBanksList();
  }

  ngOnInit() {
    // Retrieve previously selected bank and bank category from session storage if available
    const storedBank = sessionStorage.getItem('selectedBank');
    const storedCategory = sessionStorage.getItem('selectedCategory');
    
    if (storedBank) {
        this.selectedBank = JSON.parse(storedBank);
        console.log('Restored Selected Bank:', this.selectedBank);
    }

    if (storedCategory) {
        this.selectedCategory = storedCategory;
        console.log('Restored Selected Category:', this.selectedCategory);
    }

    this.loadBanksList(); // Load banks list in ngOnInit
}

loadBanksList() {
  this.util.spinnerStart(""); // Start the spinner
  this.apiResponse.getBanksList().subscribe(
    res => {
      console.log('API Response:', res); // Inspect the response
      if (res["statusCode"] == "00") {
        if (Array.isArray(res['data'])) {
          this.banks = res['data'];
          this.bankTypes = [...new Set(this.banks.map(bank => bank.bankType))];

          // Check if a category was previously selected and filter banks accordingly
          if (this.selectedCategory) {
            this.filteredBanks = this.banks.filter(bank => bank.bankType === this.selectedCategory);
          }

        } else {
          console.error('Error: Expected an array for banks data.');
          this.banks = []; // Initialize to avoid errors
        }
      } else {
        this.util.dialog(
          "Sorry!",
          "Your transaction cannot be processed at the moment, please try again later",
          ApplicationData.dialogType._MESSAGE,
          ApplicationData.dialogIcon._ERROR,
          (res: any) => {
            this.dataService.pushCancelTransaction();
          }
        );
      }
      this.initService.startMonitoring();
      this.util.spinnerStop(); // Stop the spinner
    },
    error => {
      console.error('Error fetching banks:', error);
      this.util.spinnerStop(); // Stop the spinner even on error
    }
  );
}


  
  
  // Other methods...

  selectBank(bank: any) {
    this.selectedBank = bank;
    sessionStorage.setItem('selectedBank', JSON.stringify(bank)); // Store selected bank in session storage
    console.log('Selected Bank:', this.selectedBank);
  }

  emitComponentResult(): void {
    console.log('Emitting component result:', {
      selectedBank: this.selectedBank,
    });
    this.componentResult.emit({
      selectedBank: this.selectedBank,
    });
  }

  selectCategory(category: any) {
    this.selectedCategory = category; // Set selected category
    this.emitComponentResult(); // Emit the selected category result
    sessionStorage.setItem('selectedCategory', category); // Store selected category in session storage
    console.log('Selected Bank Category:', this.selectedCategory);
  }

  goToNextStep(): boolean {
    // Check if a bank category is selected
    if (!this.selectedCategory) {
      this.util.dialog("Error", "Please select a bank category in order to proceed", ApplicationData.dialogType._MESSAGE, ApplicationData.dialogIcon._WARNING, res => { });
      console.error('Error: Please select a bank category.');
      return false;
    }
  
    // Proceed to the next step, filter banks by the selected category
    this.filteredBanks = this.banks.filter(bank => bank.bankType === this.selectedCategory);
  
    if (this.filteredBanks.length > 0) {
      setOuterSteps(1); // Set outer steps
      this.innerSteps.emit(this.componentStep);
      return true; // Successfully proceeded to the next step
    }
  
    console.error('No banks found for the selected category.');
    return false; // No banks matched the selected category
  }
  

  proceed(): boolean {
    // Check if a bank is selected
    if (!this.selectedBank.bankId || this.selectedBank.bankName === "NA") {
      this.util.dialog("Error", "Please select a bank in order to proceed", ApplicationData.dialogType._MESSAGE, ApplicationData.dialogIcon._WARNING, res => { });
      console.error('Error: Please select a bank.');
      return false;
    }
  
    // Set bank code, name, and ID using functions from GlobalFunctions
    setbankCode(this.selectedBank.bankCode);
    console.log('Set bank code:', this.selectedBank.bankCode);
  
    setbankName(this.selectedBank.bankName);
    console.log('Set bank name:', this.selectedBank.bankName);
  
    setbankId(this.selectedBank.bankId);
    console.log('Set bank ID:', this.selectedBank.bankId);

    setbankIMD(this.selectedBank.bankIMD);
    console.log('Set bank IMD:', this.selectedBank.bankIMD);
  
    this.dataService.subject.next("Selected bank: " + this.selectedBank.bankName);
    
    // Proceed with the necessary API call or navigation
     // Assuming you have a variable to track this
    return true; // All checks passed
  }
  

  stepback(): void {
    // Decrement componentStep and emit inner step event
    this.componentStep = Math.max(0, this.componentStep - 1); // Ensure componentStep doesn't go below 0
    this.innerSteps.emit(this.componentStep);
    this.filteredBanks = null;
  }
}