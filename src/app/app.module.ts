import { APP_INITIALIZER, NgModule } from '@angular/core';

import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CnicInputComponent } from './cnic-input/cnic-input.component';
import { HomeComponent } from './home/home.component';
import { OutOfServiceComponent } from './out-of-service/out-of-service.component';
import { LoadingDialogComponent } from './dialogs/loading-dialog/loading-dialog.component';
import { WebcamComponent } from './shared/webcam/webcam.component';
import { ChangePrefrencesComponent } from './change-prefrences/change-prefrences.component';
import { CashAcceptorComponent } from './transaction components/cash-acceptor/cash-acceptor.component';
import { ChequeAcceptorComponent } from './transaction components/cheque-acceptor/cheque-acceptor.component';
import { ModalInterfaceComponent } from './dialogs/modal-interface/modal-interface.component';
import { CashStuckDialogComponent } from './dialogs/cash-stuck-dialog/cash-stuck-dialog.component';
import { CashDepositOtherParentComponent } from './transaction-flows/cash-deposit/cash-deposit-other-parent/cash-deposit-parent.component';
import { CdOtherBeneficiaryDetailComponent } from './transaction-flows/cash-deposit/cd-other-beneficiary-detail/beneficiary-detail.component';
import { CdOtherTransactionDetailComponent } from './transaction-flows/cash-deposit/cd-other-transaction-detail/cd-other-transaction-detail.component';
import { CdOtherDepositorDetailComponent } from './transaction-flows/cash-deposit/cd-other-depositor-detail/cd-other-depositor-detail.component';
import { CdOtherDepositComponent } from './transaction-flows/cash-deposit/cd-other-deposit/cd-other-deposit.component';
import { CdOtherReviewComponent } from './transaction-flows/cash-deposit/cd-other-review/cd-other-review.component';
import { CdOtherResultComponent } from './transaction-flows/cash-deposit/cd-other-result/cd-other-result.component';
import { ChequeDepositOtherParentComponent } from './transaction-flows/cheque-deposit-other/ch-deposit-other-parent/cheque-deposit-parent.component';
import { ChdOtherBeneficiaryDetailComponent } from './transaction-flows/cheque-deposit-other/ch-other-beneficiary-detail/beneficiary-detail.component';
import { ChdOtherTransactionDetailComponent } from './transaction-flows/cheque-deposit-other/ch-other-transaction-detail/ch-other-transaction-detail.component';
import { ChdOtherDepositorDetailComponent } from './transaction-flows/cheque-deposit-other/ch-other-depositor-detail/ch-other-depositor-detail.component';
import { ChdOtherDepositComponent } from './transaction-flows/cheque-deposit-other/ch-other-deposit/ch-other-deposit.component';
import { ChdOtherReviewComponent } from './transaction-flows/cheque-deposit-other/ch-other-review/ch-other-review.component';
import { ChdOtherResultComponent } from './transaction-flows/cheque-deposit-other/ch-other-result/ch-other-result.component';
import { ThankYouComponent } from './thank-you/thank-you.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { WebcamModule } from 'ngx-webcam';

import { SpinnerService } from './dialogs/loading-dialog/spinner.service';
import { Initializer } from './classes/Initializer';
import { WebResponseService } from './web-response.service';

import { FilterPipe } from './Pipes/FilterPipe';

import { MaskPipe } from './Pipes/Maskings';
import { DataService } from './classes/DataService';
import { NumpadComponent } from './shared/numpad/numpad.component';
import { UbpParentComponent } from './transaction-flows/utility-bill-payment/ubp-parent/ubp-parent.component';
import { UbpInputCnicComponent } from './transaction-flows/utility-bill-payment/ubp-input-cnic/ubp-input-cnic.component';
import { UbpBillPaymentComponent } from './transaction-flows/utility-bill-payment/ubp-bill-payment/ubp-bill-payment.component';
import { UbpTransactionInputComponent } from './transaction-flows/utility-bill-payment/ubp-transaction-input/ubp-transaction-input.component';
import { UbpReviewComponent } from './transaction-flows/utility-bill-payment/ubp-review/ubp-review.component';
import { UbpResultComponent } from './transaction-flows/utility-bill-payment/ubp-result/ubp-result.component';
import { MtTransactionInputComponent } from './transaction-flows/mobile-topup/mt-transaction-input/mt-transaction-input.component';
import { MtReviewComponent } from './transaction-flows/mobile-topup/mt-review/mt-review.component';
import { MtResultComponent } from './transaction-flows/mobile-topup/mt-result/mt-result.component';
import { MtParentComponent } from './transaction-flows/mobile-topup/mt-parent/mt-parent.component';
import { MtTopupCompaniesComponent } from './transaction-flows/mobile-topup/mt-topup-companies/mt-topup-companies.component';
import { CashDepositOwnParentComponent } from './transaction-flows/cash-deposit-own/cash-deposit-own-parent/cash-deposit-own-parent.component';
import { CdOwnBeneficiaryDetailsComponent } from './transaction-flows/cash-deposit-own/cd-own-beneficiary-details/cd-own-beneficiary-details.component';
import { CdOwnReviewComponent } from './transaction-flows/cash-deposit-own/cd-own-review/cd-own-review.component';
import { CdOwnResultComponent } from './transaction-flows/cash-deposit-own/cd-own-result/cd-own-result.component';
import { ChequeDepositOwnParentComponent } from './transaction-flows/cheque-deposit-own/cheque-deposit-own-parent/cheque-deposit-own-parent.component';
import { ChOwnBeneficiaryDetailsComponent } from './transaction-flows/cheque-deposit-own/ch-own-beneficiary-details/ch-own-beneficiary-details.component';
import { ChOwnReviewComponent } from './transaction-flows/cheque-deposit-own/ch-own-review/ch-own-review.component';
import { ChOwnResultComponent } from './transaction-flows/cheque-deposit-own/ch-own-result/ch-own-result.component';
import { CdOtherBanksParentComponent } from './transaction-flows/cash-deposit-other-banks/cd-other-banks-parent/cd-other-banks-parent.component';
import { CdOtherBanksSelectionComponent } from './transaction-flows/cash-deposit-other-banks/cd-other-banks-selection/cd-other-banks-selection.component';
import { CdOtherBanksInputDetailsComponent } from './transaction-flows/cash-deposit-other-banks/cd-other-banks-input-details/cd-other-banks-input-details.component';
import { CdOtherBanksReviewComponent } from './transaction-flows/cash-deposit-other-banks/cd-other-banks-review/cd-other-banks-review.component';
import { CdOtherBanksResultComponent } from './transaction-flows/cash-deposit-other-banks/cd-other-banks-result/cd-other-banks-result.component';
import { QrcQrCodeComponent } from './transaction-flows/qr-cash-deposit/qrc-qr-code/qrc-qr-code.component';
import { QrcParentComponent } from './transaction-flows/qr-cash-deposit/qrc-parent/qrc-parent.component';
import { QrReviewComponent } from './transaction-flows/qr-cash-deposit/qr-review/qr-review.component';
import { ChTellerReviewComponent } from './transaction-flows/cheque-deposit-by-teller/ch-teller-review/ch-teller-review.component';
import { ChTellerParentComponent } from './transaction-flows/cheque-deposit-by-teller/ch-teller-parent/ch-teller-parent.component';
 

@NgModule({
  declarations: [
    AppComponent,
    CnicInputComponent,
    HomeComponent,
    OutOfServiceComponent,
    LoadingDialogComponent,
    WebcamComponent,
    FilterPipe,
    ChangePrefrencesComponent,
    CashAcceptorComponent,
    ChequeAcceptorComponent,
    MaskPipe,
    NumpadComponent,
    ModalInterfaceComponent,
    CashStuckDialogComponent,
    CashDepositOtherParentComponent,
    CdOtherBeneficiaryDetailComponent,
    CdOtherTransactionDetailComponent,
    CdOtherDepositorDetailComponent,
    CdOtherDepositComponent,
    CdOtherReviewComponent,
    CdOtherResultComponent,
    ChequeDepositOtherParentComponent,
    ChdOtherBeneficiaryDetailComponent,
    ChdOtherTransactionDetailComponent,
    ChdOtherDepositorDetailComponent,
    ChdOtherDepositComponent,
    ChdOtherReviewComponent,
    ChdOtherResultComponent,
    ThankYouComponent,
    UbpParentComponent,
    UbpInputCnicComponent,
    UbpBillPaymentComponent,
    UbpTransactionInputComponent,
    UbpReviewComponent,
    UbpResultComponent,
    MtTransactionInputComponent,
    MtReviewComponent,
    MtResultComponent,
    MtParentComponent,
    MtTopupCompaniesComponent,
    CashDepositOwnParentComponent,
    CdOwnBeneficiaryDetailsComponent,
    CdOwnReviewComponent,
    CdOwnResultComponent,
    ChequeDepositOwnParentComponent,
    ChOwnBeneficiaryDetailsComponent,
    ChOwnReviewComponent,
    ChOwnResultComponent,
    CdOtherBanksParentComponent,
    CdOtherBanksSelectionComponent,
    CdOtherBanksInputDetailsComponent,
    CdOtherBanksReviewComponent,
    CdOtherBanksResultComponent,
    QrcQrCodeComponent,
    QrcParentComponent,
    QrReviewComponent,
    ChTellerReviewComponent,
    ChTellerParentComponent 
  ],

  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule, ReactiveFormsModule,
    BrowserAnimationsModule,
    MatDialogModule,
    HttpClientModule,
    WebcamModule,
  ],

  bootstrap: [AppComponent],
  providers: [WebResponseService, SpinnerService, DataService, AppComponent,
    {
      provide: APP_INITIALIZER,
      multi: true,
      deps: [Initializer],
      useFactory: (intializeService: Initializer) => () =>
        intializeService.start(),
    },
    { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: { duration: 2000 } }, MaskPipe
  ]
}

)
export class AppModule { }
