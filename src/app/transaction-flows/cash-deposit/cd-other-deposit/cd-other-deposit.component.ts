import { Component } from '@angular/core';
import { getAccountTitle, getDepositMethod, getEnteredAmount } from 'src/app/classes/GlobalFunctions';
import { ApplicationData } from 'src/app/classes/application';

@Component({
  selector: 'cd-other-deposit',
  templateUrl: './cd-other-deposit.component.html',
  styleUrls: ['./cd-other-deposit.component.css']
})
export class CdOtherDepositComponent {
  accountTitle: any;
  amount: any;
  authorizedDenominations: any;
  nonAuthorized: boolean;
  componentLabeling: any;

  constructor() {
    this.componentLabeling = ApplicationData.labeling.cnic_screen;
    this.accountTitle = getAccountTitle();
    this.amount = getEnteredAmount();
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
  }
}
