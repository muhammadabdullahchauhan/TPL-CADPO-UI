import { AfterViewInit, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AppComponent } from 'src/app/app.component';
import { DataService } from 'src/app/classes/DataService';
import { getAccountNumber, getAccountTitle, getEnteredAmount, getTransactionPurposeId, setEnteredAmount, setTransactionPurposeId, setTransactionPurposeText } from 'src/app/classes/GlobalFunctions';
import { Initializer } from 'src/app/classes/Initializer';
import { ApplicationData } from 'src/app/classes/application';
import { WebResponseService } from 'src/app/web-response.service';

@Component({
  selector: 'cd-other-transaction-detail',
  templateUrl: './cd-other-transaction-detail.component.html',
  styleUrls: ['./cd-other-transaction-detail.component.css']
})
export class CdOtherTransactionDetailComponent implements OnInit, AfterViewInit {
  accountNumber: any;
  accountTitle: any;
  amount: string = "";
  purposeOptions: any;
  selectedPurpose_id: any;
  public selectingPurpose: boolean = false;
  transaction_amount_limit: any;
  @Output() innerSteps = new EventEmitter<any>();
  constructor(private util: AppComponent, private dataService: DataService, private initService:Initializer) {
    this.transaction_amount_limit = WebResponseService.settings.transaction_amount_limit;




  }
  ngAfterViewInit(): void {
    this.setSelectedPurpose();
  }
  ngOnInit(): void {
    this.accountNumber = getAccountNumber();
    this.accountTitle = getAccountTitle();
    this.purposeOptions = ApplicationData.sessionTransaction.transactionPurposeList;
    if (ApplicationData.sessionTransaction.state.screens.cd_other_transaction_detail_last_step == 2) {
      this.selectingPurpose = true;
    }
    else {
      this.selectingPurpose = false;
    }


    this.amount = getEnteredAmount();
  this.initService.startMonitoring();
  }

  setSelectedPurpose() {
    const radioButton = document.getElementById("radio--" + getTransactionPurposeId());
    if (radioButton && radioButton instanceof HTMLInputElement) {
      radioButton.checked = true;
    }
  }

  typeNumeric(character: string) {



    if (character == "D") {
      this.amount = this.amount.slice(0, -1);
    }
    else if (character == "C") {
      this.amount = "";
    }
    else {
      if (this.amount.length < 6) {
        this.amount += character;
      }
    }
    setEnteredAmount(this.amount);
  }

 
  choosePurpose() {



    if (this.amount == undefined || this.amount == null || this, this.amount == "" || Number(this.amount) <= 0) {
      this.util.dialog(WebResponseService.messages.msg_err_enter_amount.heading, WebResponseService.messages.msg_err_enter_amount.message, ApplicationData.dialogType._MESSAGE, ApplicationData.dialogIcon._WARNING, res => { });
      return;
    }
    if (Number(this.amount) > Number(this.transaction_amount_limit)) {
      this.util.dialog(WebResponseService.messages.msg_err_less_amount.heading, WebResponseService.messages.msg_err_less_amount.message.replace("{amount}", WebResponseService.settings.transaction_amount_limit), ApplicationData.dialogType._MESSAGE, ApplicationData.dialogIcon._WARNING, res => { });
      return;
    }


    if (!this.isMultipleOf10(Number(this.amount))) {
      this.util.dialog("Oops!", "Entered amount should be multiple of 10's", ApplicationData.dialogType._MESSAGE, ApplicationData.dialogIcon._WARNING, res => { });
      return;
    }
    ApplicationData.sessionTransaction.state.screens.cd_other_transaction_detail_last_step = 2;
    this.selectingPurpose = true;
    setTimeout(() => {
      this.setSelectedPurpose();
    }, 100);
    this.setSelectedPurpose();
    setEnteredAmount(this.amount);
    this.innerSteps.emit(1);
  }

  isMultipleOf10(amount: number): boolean {

    if (amount % 10 === 0 || (amount > 70 && amount % 5 === 0)) {
      return true;
    }
    else {
      return false;
    }

  }

  selectPurpose(selectedPurpose: any, optionName: any) {
    this.selectedPurpose_id = selectedPurpose;
    setTransactionPurposeId(selectedPurpose);
    setTransactionPurposeText(optionName);
    //  this.txtPurpose.nativeElement.value = optionName;
  }


}