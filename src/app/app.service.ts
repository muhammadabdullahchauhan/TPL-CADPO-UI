import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  private modalDataSubject = new BehaviorSubject<any>(null);
  modalData$ = this.modalDataSubject.asObservable();

  constructor() { }
  setModalData(data: any) {
    this.modalDataSubject.next(data);
  }
}
