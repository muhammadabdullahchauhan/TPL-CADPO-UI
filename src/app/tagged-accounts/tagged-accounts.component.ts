import { AfterViewInit, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { setAccountNumber } from '../classes/GlobalFunctions';
import { AppComponent } from '../app.component';
import { Initializer } from '../classes/Initializer';

@Component({
  selector: 'app-tagged-accounts',
  templateUrl: '../../assets/htmls/tagged-accounts.component.html',
  styleUrls: ['./tagged-accounts.component.css']
})
export class TaggedAccountsComponent {
  public taggedAccounts: any = null;
  public beneficiariesAccounts: any = null;

  @Output() componentResult = new EventEmitter<any>();

  constructor(private _router: Router, private app: AppComponent, private initService: Initializer) {
    this.taggedAccounts = null;
    this.beneficiariesAccounts = null;


  }




  selectAccount(accountNumber: any) {
    setAccountNumber(accountNumber);
  }

  selectAndNavigate(accountNumber: any) {
    setAccountNumber(accountNumber);
    this.app.spinnerStart("Loading");
    setTimeout(() => {
      this.app.spinnerStop();
      this.componentResult.emit();
    }, 1000);

  }

  continueTransaction(data: any) {
    if (data == 0) {
      setAccountNumber("");
    }
    this.app.spinnerStart("Loading");
    setTimeout(() => {
      this.app.spinnerStop();
      this.componentResult.emit();
    }, 1000);
  }

  cancelTransaction() {
  //  this.app.cancelTransaction();

  }
}
