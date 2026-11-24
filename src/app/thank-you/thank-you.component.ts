import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { ApplicationData } from "../classes/application";
import {
  logoutCustomer,
  clearTransactionSession,
} from "../classes/GlobalFunctions";
import { AppComponent } from "../app.component";
import { DataService } from "../classes/DataService";
import { Initializer } from "../classes/Initializer";

@Component({
  selector: "app-thank-you",
  templateUrl: "./thank-you.component.html",
  styleUrls: ["./thank-you.component.css"],
})
export class ThankYouComponent {
  constructor(
    private _router: Router,
    private util: AppComponent,
    private dataService: DataService,
    private initService: Initializer,
  ) {
    localStorage.setItem("refreshed", "thankyou");
    this.initService.stopMonitoring();
    logoutCustomer();
    clearTransactionSession();
    this.util.spinnerStop();
    ApplicationData.perefernces.pendingCancellation = false;
    setTimeout(() => {
      this.dataService.subject.next("Transaction Ended\n\n");
    }, 1500);

    setTimeout(() => {
      if (ApplicationData.perefernces.lastServiceStatus === "IN SERVICE") {
        this._router.navigate(["home"]);
      } else {
        this._router.navigate(["out-of-service"]);
      }
    }, 2000);
  }
}
