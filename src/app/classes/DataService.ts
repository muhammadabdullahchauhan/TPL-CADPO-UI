// src/app/classes/DataService.ts
import { Subject } from 'rxjs';
import { WebResponseService } from '../web-response.service';
import { Injectable, OnDestroy } from '@angular/core';
import { ApplicationData } from './application';

@Injectable({
  providedIn: 'root',
})
export class DataService implements OnDestroy {
  chequeDeposit = new Subject();
  subject = new Subject();
  cancelTransaction = new Subject();
  abandonedTransaction = new Subject();
  hardwareBusy = new Subject<boolean>();
  cashDeposited = new Subject();

  private currentMessage: any;

  private categorySource = new Subject<any>();
  private companySource = new Subject<any>();

  currentCategory = this.categorySource.asObservable();
  currentCompany = this.companySource.asObservable();

  constructor(private apiResponse: WebResponseService) {
    this.subject.subscribe(val => {
      this.currentMessage = val;
      this.apiResponse.postEJMessage(this.currentMessage.toUpperCase())?.subscribe(res => {
      }, err => {
        console.log("EJ Error");
      });
    });
  }

  ngOnDestroy(): void {
    console.log("DataService ngOnDestroy");
  }

  pushHardwareBusy(state: boolean) {
    ApplicationData.perefernces.pendingResponse = state;
    this.hardwareBusy.next(state);
  }

  onHardwareBusy() {
    return this.hardwareBusy.asObservable();
  }

  pushAbandonedTransaction(data: any = true) {
    this.abandonedTransaction.next(data);
  }

  onAbandonedCancel() {
    console.log("onAbandonedCancel");
    return this.abandonedTransaction.asObservable();
  }

  pushCancelTransaction(data: any = true) {
    this.cancelTransaction.next(data);
  }

  onTransactionCancel() {
    return this.cancelTransaction.asObservable();
  }

  pushCashDeposit(data: any) {
    this.cashDeposited.next(data);
  }

  onCashDeposit() {
    return this.cashDeposited.asObservable();
  }

  pushChequeDeposit(data: any) {
    this.chequeDeposit.next(data);
  }

  onChequeDeposit() {
    return this.chequeDeposit.asObservable();
  }

  // Methods for category and company
  changeCategory(category: any) {
    this.categorySource.next(category);
  }

  changeCompany(company: any) {
    this.companySource.next(company);
  }
}
