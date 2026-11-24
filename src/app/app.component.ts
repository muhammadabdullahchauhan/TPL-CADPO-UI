import { ChangeDetectorRef, Component } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  Router,
} from "@angular/router";

import { WebResponseService } from "./web-response.service";

import {
  LogMethod,
  clearTransactionSession,
  consoleLog,
  logoutCustomer,
  validateAuthorization,
} from "./classes/GlobalFunctions";
import { ApplicationData } from "./classes/application";
import { stopStatusService } from "./classes/DeviceHealth";
import { SpinnerService } from "./dialogs/loading-dialog/spinner.service";

import { Subject, interval, Subscription } from "rxjs";
import { DataService } from "./classes/DataService";
import { Initializer } from "./classes/Initializer";
import {
  ModalInterfaceComponent,
  ModalInterfaceModel,
} from "./dialogs/modal-interface/modal-interface.component";
import { MockService } from "./classes/MockService/mock-service.service";

declare function animateHomeButtons(): any;

@Component({
  selector: "app-root",
  templateUrl: "../assets/htmls/app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent {
  title = "cdpm";
  CurrentDate = new Date();
  weekday = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  dayName = this.weekday[this.CurrentDate.getDay()];
  //clockTimer: Subscription;

  result: any;
  hiddenLeft: any = 0;
  idleTimeout: any;
  spinnerRef: any;

  // webcam snapshot trigger
  pictureTrigger: Subject<boolean> = new Subject();
  cameraSwitcher: Subject<boolean> = new Subject();

  langaugesArray: any;
  isHomePage: boolean = false;
  isHome: boolean = false;
  isRestrictedScreen: boolean = false;
  selectedLanguage: any;
  observeSender: Subscription;
  activityOn: any;
  apiData: any;

  subscription: Subscription;
  inactivityTimeout: number;
  inactivityConfirmation: boolean = false;
  loggedIn: boolean = false;
  myTimeout: any;
  dialogData: any;
  pendingCash: any = 0;
  walletTimeRemaining: number = 60;
  walletTimerInterval: any = null;
  inservice: boolean = false;
  activeComponent: any;
  btnDisabled: boolean = false;
  supervisoryGestureTimeout: any;
  supervisorySecondStepTimeout: any;
  currentImageEventId: string = "";

  constructor(
    private apiResponse: WebResponseService,
    private initService: Initializer,
    private mock: MockService,
    public dialogService: MatDialog,
    public spinnerService: SpinnerService,
    private _router: Router,
    private ref: ChangeDetectorRef,
    private dataService: DataService,
  ) {
    setTimeout(() => {
      this.getLanguages();
    }, 1000);

    ApplicationData.perefernces.superUser = false;
    //ApplicationData.customer.collectedAmount = 500;

    this._router.events.subscribe((event: any) => {
      // Ensure the dialog runs only for the home page and when collectedAmount > 0
      if (
        this._router.url.includes("home") &&
        ApplicationData.customer.collectedAmount > 0
      ) {
        // Check if the event is an instance of NavigationEnd to show the dialog only when the user is on the home page
        if (event instanceof NavigationEnd) {
          this.startHomeWalletTimer();
          this.dialog(
            "Available Wallet Balance",
            "You have a remaining balance of PKR " +
              ApplicationData.customer.collectedAmount +
              " in your wallet. Please select a transaction within 1 minute to use this amount, otherwise it will expire.",
            ApplicationData.dialogType._MESSAGE,
            ApplicationData.dialogIcon._INFO,
            (res) => {},
            "",
            true,
          );
        }
      }

      // Check if the event is an instance of NavigationEnd
      if (event instanceof NavigationEnd) {
        this.spinnerStop();
      }
    });

    this._router.url;
    this._router.events.subscribe((event: any) => {
      //  console.log(_router.url);
      if (
        this._router.url.includes("home") ||
        this._router.url.includes("out-of-service") ||
        this._router.url.includes("thankyou")
      ) {
        this.isHomePage = true;
      } else {
        this.isHomePage = false;
      }
      if (this._router.url.includes("home")) {
        this.isHome = true;
      } else {
        this.isHome = false;
        this.stopHomeWalletTimer();
      }
      switch (true) {
        case event instanceof NavigationEnd: {
          this.activeComponent = this.getCurrentRouteComponentName();
          this.spinnerStop();
          this.resetSupervisoryGesture();
          if (this.isHome && ApplicationData.customer.collectedAmount > 0) {
            this.startHomeWalletTimer();
          } else if (!this.isHome) {
            this.stopHomeWalletTimer();
          }
          break;
        }

        case event instanceof NavigationCancel:
        case event instanceof NavigationError: {
          //  animateHomeButtons();
          //     this.spinnerService.stop(this.spinnerRef);

          this.spinnerStop();

          break;
        }
        default: {
          break;
        }
      }
    });

    this._router.url;
    this._router.events.subscribe((event: any) => {
      //  console.log(_router.url);
      if (
        this._router.url.includes("out-of-service") ||
        this._router.url.includes("thankyou")
      ) {
        this.isRestrictedScreen = true;
      } else {
        this.isRestrictedScreen = false;
      }
      switch (true) {
        case event instanceof NavigationEnd: {
          this.activeComponent = this.getCurrentRouteComponentName();
          this.spinnerStop();
          this.resetSupervisoryGesture();
          break;
        }

        case event instanceof NavigationCancel:
        case event instanceof NavigationError: {
          //  animateHomeButtons();
          //     this.spinnerService.stop(this.spinnerRef);

          this.spinnerStop();

          break;
        }
        default: {
          break;
        }
      }
    });

    this._router.navigate(["out-of-service"]);

    const actSource = interval(1000);
    this.subscription = actSource.subscribe((val) => {
      this.activityOn = Initializer.activitySession;
    });

    setInterval(() => {
      this.pendingCash = ApplicationData.customer.collectedAmount;
      if (
        this.isHome &&
        this.pendingCash > 0 &&
        !this.isRestrictedScreen &&
        !this.walletTimerInterval
      ) {
        this.startHomeWalletTimer();
      } else if (
        (!this.isHome || this.pendingCash <= 0) &&
        this.walletTimerInterval
      ) {
        this.stopHomeWalletTimer();
      }

      if (validateAuthorization()) {
        this.loggedIn = true;
      } else {
        this.loggedIn = false;
      }

      if (ApplicationData.perefernces.inservice) {
        if (
          localStorage.getItem("refreshed") != "result" &&
          localStorage.getItem("refreshed") != "transactioninprocess" &&
          localStorage.getItem("refreshed") != "thankyou"
        ) {
          this.inservice = true;
        } else {
          this.inservice = false;
        }
      } else {
        this.inservice = false;
      }
    }, 1500);

    this.dataService.onHardwareBusy().subscribe((data) => {
      this.btnDisabled = data;
    });
  }

  getCurrentRouteComponentName(): string | null {
    let route = this._router.routerState.root;
    while (route.firstChild) {
      route = route.firstChild;
    }
    if (route.snapshot && route.snapshot.component) {
      return route.snapshot.component.name;
    }
    return null;
  }

  get formattedWalletTime(): string {
    const minutes = Math.floor(this.walletTimeRemaining / 60);
    const seconds = this.walletTimeRemaining % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }

  startHomeWalletTimer() {
    this.stopHomeWalletTimer();
    this.walletTimeRemaining = 60;

    this.walletTimerInterval = setInterval(() => {
      if (!this.isHome || ApplicationData.customer.collectedAmount <= 0) {
        this.stopHomeWalletTimer();
        return;
      }

      if (this.walletTimeRemaining > 0) {
        this.walletTimeRemaining--;
      }

      if (this.walletTimeRemaining <= 0) {
        this.stopHomeWalletTimer();
        this.clearWalletAmount();
      }
    }, 1000);
  }

  stopHomeWalletTimer() {
    if (this.walletTimerInterval) {
      clearInterval(this.walletTimerInterval);
      this.walletTimerInterval = null;
    }
  }

  clearWalletAmount() {
    ApplicationData.customer.collectedAmount = 0;
    this.pendingCash = 0;
    this.dialogService.closeAll();
    console.log("Home wallet timer expired. Wallet balance cleared.");
  }

  btnWallet() {
    console.log("btnWallet clicked");
    console.log("pendingCash:", this.pendingCash);
    console.log("btnDisabled:", this.btnDisabled);

    if (ApplicationData.customer.collectedAmount > 0) {
      const timeNote = this.isHome
        ? " Please select a transaction within " +
          this.walletTimeRemaining +
          " seconds to use this amount, otherwise it will expire."
        : " You can conveniently use this amount towards your current transaction.";

      this.dialog(
        "Available Wallet Balance",
        "You currently have PKR " +
          ApplicationData.customer.collectedAmount +
          " available in your wallet." +
          timeNote,
        ApplicationData.dialogType._MESSAGE,
        ApplicationData.dialogIcon._INFO,
        (res) => {},
        "",
        true,
      );
    }
  }

  @LogMethod
  getLanguages() {
    if (
      ApplicationData.labeling &&
      ApplicationData.perefernces.languages != null
    ) {
      this.langaugesArray = ApplicationData.perefernces.languages;
      this.selectedLanguage =
        ApplicationData.labeling.localization.settings.langCode;
    }
  }

  @LogMethod
  toggleLanguageSelector() {
    document
      .querySelector(".lang-selector-div")
      ?.classList.toggle("slide-in-top");
  }

  @LogMethod
  changeLanguage(languageCode) {
    this.selectedLanguage = languageCode;
    if (WebResponseService.messages) {
      //  this.spinnerRef = this.spinnerService.start("Loading");
      this.spinnerStart("Loading");
    }

    this.apiResponse.getLangMessages(languageCode).subscribe(
      (messages) => {
        WebResponseService.messages = {
          ...messages,
        };

        this.apiResponse.getLangLabels(languageCode).subscribe((labels) => {
          ApplicationData.labeling = {
            ...labels,
          };

          //    this.spinnerService.stop(this.spinnerRef);
          this.spinnerStop();
          document
            .querySelector(".lang-selector-div")
            ?.classList.remove("slide-in-top");
          this._router.navigateByUrl("change-pref", {
            state: { url: this._router.url },
          });
        });
      },
      (err) => {},
    );
  }

  checkUserType(): boolean {
    return ApplicationData.perefernces.superUser;
  }

  resetSupervisoryGesture() {
    clearTimeout(this.supervisoryGestureTimeout);
    this.hiddenLeft = 0;
  }

  // @LogMethod
  // takePicture() {
  //   this.pictureTrigger.next(true);
  // }

  // @LogMethod
  // recieveImage(data) {

  //   this.apiResponse.postTransactionImage(data._imageAsDataUrl).subscribe(async (data: any) => {
  //     consoleLog("transaction-input.component.ts", "Image Posted", data);
  //   }, err => {

  //     this.dataService.subject.next("Error Posting Image");
  //     consoleLog("transaction-input.component.ts", "Image Posted Error", err);
  //   });
  // }

  @LogMethod
  takePicture(eventName: string) {
    console.log(`[takePicture] Called with eventName: "${eventName}"`);

    const eventsCandidate =
      ApplicationData.sessionTransaction.transactionImageEvents;

    let events: any[] = [];
    if (Array.isArray(eventsCandidate)) {
      events = eventsCandidate;
    } else {
      console.warn(
        "[takePicture] transactionImageEvents is not an array!",
        eventsCandidate,
      );
    }

    const eventNameLower = eventName.toLowerCase();

    const event = events.find(
      (e: any) => e.eventName.toLowerCase() === eventNameLower,
    );

    if (event && event.transactionImageEventId != null) {
      // Use event ID as is, no padding
      this.currentImageEventId = event.transactionImageEventId.toString();
      console.log(`[takePicture] Found event:`, event);
      console.log(
        `[takePicture] Set currentImageEventId to: ${this.currentImageEventId}`,
      );
    } else {
      console.warn(
        `[takePicture] Event name '${eventName}' not found. Using fallback ID '0001'.`,
      );
      this.currentImageEventId = "0001";
    }

    console.log(`[takePicture] Triggering picture capture...`);
    this.pictureTrigger.next(true);
  }

  @LogMethod
  recieveImage(data) {
    console.log(`[recieveImage] Received image data`, data);

    const imagePayload = {
      image: data._imageAsDataUrl,
      eventId: this.currentImageEventId,
    };

    console.log(`[recieveImage] Prepared imagePayload:`, imagePayload);

    this.apiResponse.postTransactionImage(imagePayload).subscribe(
      async (response: any) => {
        consoleLog("transaction-input.component.ts", "Image Posted", response);
        console.log(`[recieveImage] Image posted successfully`, response);
      },
      (err) => {
        this.dataService.subject.next("Error Posting Image");
        consoleLog("transaction-input.component.ts", "Image Posted Error", err);
        console.error(`[recieveImage] Error posting image`, err);
      },
    );
  }

  @LogMethod
  switchCamera() {
    console.log("[switchCamera] Switching camera... Not implemented");
    return;
    this.cameraSwitcher.next(true);
  }

  @LogMethod
  logoutConfirmation() {
    this.inactivityConfirmation = true;
    this.dialog(
      WebResponseService.messages.confirm_dismiss_session.heading,
      WebResponseService.messages.confirm_dismiss_session.message,
      ApplicationData.dialogType._CONFIRMATION,
      ApplicationData.dialogIcon._CONFIRMATION,
      (result) => {
        if (result == true) {
          logoutCustomer();
          clearTransactionSession();
          this.dialogService.closeAll();
          //this._router.navigate(['home']);
        }
      },
    );
  }

  initAgentCall() {
    this.dialog(
      "Call Banking Officer",
      "Would you like to contact support agent?",
      ApplicationData.dialogType._CONFIRMATION,
      "diag_icon_support.png",
      (result) => {
        if (result == true) {
          this.apiResponse.callVideoAgent().subscribe((data: any) => {});
        }
      },
    );
  }

  spinnerStart(message: any) {
    this.spinnerStop();
    this.spinnerRef = this.spinnerService.start(message);
  }

  spinnerStop() {
    while (this.spinnerRef != null) {
      this.spinnerService.stop(this.spinnerRef);
      this.spinnerRef = null;
    }
  }

  dismissAllDialogues() {
    this.dialogService.closeAll();
  }

  dialog(
    title: string,
    message: string,
    type: number,
    icon: any,
    callback: Function,
    componentName: string = "",
    exclusive: boolean = false,
  ): void {
    // Close any existing dialogs first
    this.dialogService.closeAll();
    console.log("dialog prior to check: " + exclusive);

    // Bypass this specific message on idle screen
    const refreshedState = localStorage.getItem("refreshed");
    if (
      refreshedState === "idle" &&
      title === "Sorry!" &&
      message ===
        "Your transaction cannot be processed at the moment, please try again later"
    ) {
      console.log("Specific dialog message bypassed due to idle state.");
      return;
    }

    // Allow bypass for all specified components
    const allowedComponents = [
      "CashDepositOtherParentComponent",
      "ChequeDepositOtherParentComponent",
      "CashDepositOwnParentComponent",
      "CdOtherBanksParentComponent",
      "ChequeDepositOwnParentComponent",
      "UbpParentComponent",
      "MtParentComponent",
    ];

    if (
      componentName &&
      !allowedComponents.includes(componentName) &&
      componentName !== this.activeComponent
    ) {
      console.log(
        `Dialog bypassed because active component (${this.activeComponent}) does not match ${componentName}.`,
      );
      return;
    }

    // Create the dialog data and open the modal dialog
    const dialogData = new ModalInterfaceModel(title, message, type, icon);
    const dialogRef = this.dialogService.open(ModalInterfaceComponent, {
      maxWidth: "700",
      data: dialogData,
    });

    // Prevent closing the dialog unless explicitly allowed
    dialogRef.disableClose = true;
    dialogRef.afterClosed().subscribe((dialogResult) => {
      // Execute the callback once the dialog is closed
      callback(dialogResult);
    });
  }

  customerDialog(content: any, type: Number, callback: Function): void {
    const dialogData = new ModalInterfaceModel("", "", type, "", content);
    const dialogRef = this.dialogService.open(ModalInterfaceComponent, {
      maxWidth: "700",
      data: dialogData,
    });

    dialogRef.disableClose = true;
    dialogRef.afterClosed().subscribe((dialogResult) => {
      //  this.result = dialogResult;
      callback(dialogResult);
    });
  }

  notificationModal(
    title: String,
    message: String,
    iconPath: String,
    isWaitingDialog: boolean,
  ) {
    let notificationBundle = {
      title: title,
      message: message,
      iconPath: iconPath,
      isWaitingDialog: isWaitingDialog,
    };
    // this.appService.setModalData(notificationBundle);
  }

  btnHome() {
    if (ApplicationData.perefernces.pendingResponse) {
      return;
    }
    this.btnDisabled = true;
    setTimeout(() => {
      this.btnDisabled = false;
    }, 2000);
    this.dataService.pushCancelTransaction("customer");
  }
}
