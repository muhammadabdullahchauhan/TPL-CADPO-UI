import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChangePrefrencesComponent } from './change-prefrences/change-prefrences.component';
import { CnicInputComponent } from './cnic-input/cnic-input.component';
import { HomeComponent } from './home/home.component';
import { OutOfServiceComponent } from './out-of-service/out-of-service.component';
import { PaymentBillComponent } from './payment-bill/payment-bill.component';
import { ResetAppComponent } from './reset-app/reset-app.component';
import { SplashComponent } from './splash/splash.component';

import { CashDepositOtherParentComponent } from './transaction-flows/cash-deposit/cash-deposit-other-parent/cash-deposit-parent.component';

import { ThankYouComponent } from './thank-you/thank-you.component';
import { ChequeDepositOtherParentComponent } from './transaction-flows/cheque-deposit-other/ch-deposit-other-parent/cheque-deposit-parent.component';
import { UbpParentComponent } from './transaction-flows/utility-bill-payment/ubp-parent/ubp-parent.component';
import { state } from '@angular/animations';
import { MtParentComponent } from './transaction-flows/mobile-topup/mt-parent/mt-parent.component';
import { CashDepositOwnParentComponent } from './transaction-flows/cash-deposit-own/cash-deposit-own-parent/cash-deposit-own-parent.component';
import { ChequeDepositOwnParentComponent } from './transaction-flows/cheque-deposit-own/cheque-deposit-own-parent/cheque-deposit-own-parent.component';
import { CdOtherBanksParentComponent } from './transaction-flows/cash-deposit-other-banks/cd-other-banks-parent/cd-other-banks-parent.component';
import { QrcParentComponent } from './transaction-flows/qr-cash-deposit/qrc-parent/qrc-parent.component';
import { ChTellerParentComponent } from './transaction-flows/cheque-deposit-by-teller/ch-teller-parent/ch-teller-parent.component';

const routes: Routes = [
  {
    path: '',
    // redirectTo: '/out-of-service', pathMatch: 'full'
    redirectTo: '/splash', pathMatch: 'full'
  },
  {
    path: 'splash',
    component: SplashComponent,
    data: { state: 'splash' }
  },
  {
    path: 'home',
    component: HomeComponent
    , data: { state: 'home' }
  },
  {
    path: 'cash-deposit-other',
    component: CashDepositOtherParentComponent
    , data: { state: 'home' }
  },
  {
    path: 'cheque-deposit-other',
    component: ChequeDepositOtherParentComponent
    , data: { state: 'home' }
  },

  {
    path: 'cheque-deposit-teller',
    component: ChTellerParentComponent
    , data: { state: 'home' }
  },

  {
    path: 'cash-deposit-own',
    component: CashDepositOwnParentComponent
    , data: { state: 'home' }
  },

  {
    path: 'cash-deposit-interbank',
    component: CdOtherBanksParentComponent
    , data: { state: 'home' }
  },

  {
    path: 'cheque-deposit-own',
    component: ChequeDepositOwnParentComponent
    , data: { state: 'home' }
  },

  {
    path: 'cnic-input',
    component: CnicInputComponent
    , data: { state: 'cnic' }
  },

 
   {
    path: 'out-of-service',
    component: OutOfServiceComponent
    , data: { state: 'out-of-service' }

  }

 
  , {
    path: 'thankyou',
    component: ThankYouComponent
    , data: { state: 'transaction-result' }

  }

  , {
    path: 'change-pref',
    component: ChangePrefrencesComponent
    , data: { animation: 'fader' }

  }
  ,
  {
    path: 'payment-bill',
    component: PaymentBillComponent
    , data: { animation: 'fader' }

  },
 
   {
    path: 'reset',
    component: ResetAppComponent
    , data: { animation: 'fader' }

  } ,
  // Utility Bill Payment

  {
    path: 'utility-bill',
    component: UbpParentComponent
    , data: { state: 'home' }

  },

  // Mobile TopUp

  {
    path: 'mobile-topup',
    component: MtParentComponent
    , data: { state: 'home' }

  },

  {
    path: 'qr-deposit',
    component: QrcParentComponent
    , data: { state: 'home' }

  },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
