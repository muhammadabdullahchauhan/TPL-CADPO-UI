import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { WebResponseService } from './web-response.service';
import { DataService } from './classes/DataService';
import { AppComponent } from './app.component';
import { ApplicationData } from './classes/application';
import { setTransactionNumber, setTransactionStatus } from './classes/GlobalFunctions';

@Injectable({
  providedIn: 'root',
})
export class TransactionLayers {
  constructor(
    private apiResponse: WebResponseService,
    private dataService: DataService,
    private util: AppComponent
  ) {}

  handleTransactionResponse(transactionResponse: any): Observable<void> {
    console.log('Handle Response Service', transactionResponse);
    return new Observable(observer => {
      setTransactionNumber(transactionResponse["data"]["transactionNumber"]);
      let stackDetail = [];
      if (transactionResponse["statusCode"] !== "00" && transactionResponse["statusCode"] !== "99" && transactionResponse["statusCode"] !== "02") {
        setTransactionStatus("Failed");
        this.dataService.subject.next("Transaction Failed");
        observer.next();
        observer.complete();
        return;
      }
      
      this.util.spinnerStart("");
      let denom = JSON.parse(String(sessionStorage.getItem("currentDenom")));
      const walletAmount = ApplicationData.customer.collectedAmount;
      
      if ((denom && walletAmount) || (denom && !walletAmount)) {
        this.apiResponse.acceptorStack().subscribe(
          (stackResponse: any) => {
            if (stackResponse["code"] === "0000" || stackResponse["code"] === "CSH_ACP_0000") {
              this.dataService.subject.next("STACK STATUS SUCCESS");
              if (stackResponse['data']) {
                stackDetail = stackResponse['data'];
              }
              this.apiResponse.updateTransactionStatus("Success", stackDetail).subscribe(
                () => {
                  this.apiResponse.TWARE_endTransaction().subscribe((endTransactionResponse: any) => {
                    if (endTransactionResponse["statusCode"] === "00") {
                      sessionStorage.removeItem("TWARE_transactionId");
                    }
                  });
                },
                () => {
                  setTransactionStatus("Suspect");
                  this.dataService.subject.next("Transaction Suspected");
                }
              );
              sessionStorage.setItem("pendingDrop", "false");
              ApplicationData.sessionTransaction.denominationsStacked = true;
            } else {
              sessionStorage.setItem("pendingDrop", "true");
              this.dataService.subject.next("STACK STATUS PENDING");
            }
            this.util.spinnerStop();
            observer.next();
            observer.complete();
          },
          (error: any) => {
            this.handleErrorFlow(error);
            observer.error(error);
          }
        );
      } else if (walletAmount && !denom) {
        this.apiResponse.updateTransactionStatus("Success", []).subscribe(
          () => {
            this.apiResponse.TWARE_endTransaction().subscribe((endTransactionResponse: any) => {
              if (endTransactionResponse["statusCode"] === "00") {
                sessionStorage.removeItem("TWARE_transactionId");
              }
            });
          },
          () => {
            setTransactionStatus("Suspect");
            this.dataService.subject.next("Transaction Suspected");
          }
        );
        sessionStorage.setItem("pendingDrop", "false");
        ApplicationData.sessionTransaction.denominationsStacked = true;
        this.util.spinnerStop();
        observer.next();
        observer.complete();
      }
    });
  }

  handleErrorFlow(error: any): void {
    this.dataService.subject.next("STACK STATUS ERROR");
    this.apiResponse.updateCashAcceptorHealth(error["errors"]["errorCode"], error["errors"]["errorMessage"]);
    this.dataService.subject.next("Pushing Device Health Errors");
    this.util.spinnerStop();
  }
}

//Use like this
// if (transactionResponse["statusCode"] == "00") {
            //   this.dataService.subject.next("Transaction Success");
            //   setTransactionStatus("Success");
            //   setTransactionResponseBehavior(true, true, false, "thankyou", "");
            
            //   this.txnLyr.handleTransactionResponse(transactionResponse).subscribe(() => {
            //     this.componentResult.emit({ step: true, value: "Transaction Completed" });
            //   }); // ✅ Proper subscription
            // } 
            // else if (transactionResponse["statusCode"] == "02" || transactionResponse["statusCode"] == "99") {
            //   this.dataService.subject.next("Transaction Error");
            //   setTransactionStatus("Suspect");
            //   setTransactionResponseBehavior(true, true, false, "thankyou", "");
            
            //   this.txnLyr.handleTransactionResponse(transactionResponse).subscribe(() => {
            //     this.componentResult.emit({ step: true, value: "Transaction Suspect" });
            //   }); // ✅ Emits suspect transaction result
            // } 
            // else if (transactionResponse["statusCode"] == "03") {
            //   this.dataService.subject.next("Transaction failed");
            //   setTransactionStatus("failed");
            //   setTransactionResponseBehavior(false, false, true, "thankyou", "");
            
            //   this.txnLyr.handleTransactionResponse(transactionResponse).subscribe(() => {
            //     this.componentResult.emit({ step: true, value: "Transaction Failed" });
            //   }); // ✅ Emits failed transaction result
            // } 
            // else {
            //   if (transactionResponse["statusCode"] == "06") {
            //     this.dataService.subject.next("Bag Capacity Reached");
            //   }
            //   this.dataService.subject.next("Transaction Error");
            //   setTransactionResponseBehavior(false, false, true, "thankyou", transactionResponse['responseMessage']);
            
            //   this.txnLyr.handleTransactionResponse(transactionResponse).subscribe(() => {
            //     this.componentResult.emit({ step: true, value: "Transaction Error" });
            //   }); // ✅ Emits error transaction result
            // }