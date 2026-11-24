import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { WebResponseService } from "../web-response.service";
import { stopStatusService } from "../classes/DeviceHealth";
import { ApplicationData } from "../classes/application";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";

import {
  consoleLog,
  getDepositMethod,
  getTransactiontTitle,
  getTransactionType,
  initializeEnvironment,
  LogMethod,
  logoutCustomer,
  setDepositMethod,
  setTransactiontTitle,
  setTransactionType,
  validateAuthorization,
  validateLogin,
} from "../classes/GlobalFunctions";
import { Subject } from "rxjs";
import { WebcamImage } from "ngx-webcam";

import SwiperCore, { Navigation, Autoplay, Swiper } from "swiper";

import { SwiperComponent } from "swiper/angular";
import { DataService } from "../classes/DataService";
import { AppComponent } from "../app.component";
import { MockService } from "../classes/MockService/mock-service.service";
import { Initializer } from "../classes/Initializer";

SwiperCore.use([Navigation, Autoplay]);

declare function initBannersCrousel(): any;
declare function initTransactionsCrousel(): any;

@Component({
  selector: "app-home",
  templateUrl: "../../assets/htmls/home.component.html",
  styleUrls: ["./home.component.css"],
})
export class HomeComponent implements AfterViewInit, OnInit {
  slides = [
    { image: "../assets/img/Main-01.png" },
    // Add more slides as needed
  ];
  apiData: any;
  deviceCode: any;
  deviceIP: any;
  dialogRef: any;
  spinner: any;
  currentImageEventId: string = "";
  myTimeout: any;
  result: any;
  transactionSections: any;
  cashTransactions: {
    cateogryType: any;
    transactions: any;
  };

  webcamImage: any;
  pictureTrigger: Subject<boolean> = new Subject();

  componentLabeling: any;
  form_direction: any;
  numWords = require("num-words");
  transactionSwiper: any;
  transactionsLoaded: boolean = false;
  initTransaction = {
    bioRequired: true,
    depositorRequired: "",
  };

  btnIsBusy: boolean = false;
  selectedCardKey: string = "";
  cardsReady: boolean = false;

  currentDate: Date = new Date();
  dateTimeTimer: any;
  weekdayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  get formattedDate(): string {
    const day = this.weekdayNames[this.currentDate.getDay()];
    const m = this.monthNames[this.currentDate.getMonth()];
    const d = this.currentDate.getDate();
    const y = this.currentDate.getFullYear();
    return `${day}, ${m} ${d}, ${y}`;
  }

  get formattedTime(): string {
    if (!this.currentDate) return "";
    let hours = this.currentDate.getHours();
    const minutes = this.currentDate.getMinutes();
    const seconds = this.currentDate.getSeconds();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strMinutes = minutes < 10 ? "0" + minutes : minutes;
    const strHours = hours < 10 ? "0" + hours : hours;
    const strSeconds = seconds < 10 ? "0" + seconds : seconds;
    return `${strHours}:${strMinutes}:${strSeconds} ${ampm}`;
  }

  homeCards: any[] = [];
  homeColumns: any[] = [];
  displayMultiCards: any[] = [];
  cashCards: any[] = [];
  chequeCards: any[] = [];
  otherCards: any[] = [];

  get cardIconSize(): number {
    if (this.homeCards.length <= 3) return 38;
    return 24;
  }

  getDefaultHomeCards(): any[] {
    return [
      {
        type: "cash",
        title: "Cash Deposit",
        subtitle: "Digitize your deposits",
        categoryType: "Cash Deposit Transactions",
        actionName: "Deposit to Other Account",
        typeId: 2,
        isBioRequired: true,
        iconBg: "#FFF0E6",
        arrowColor: "#5A6B87",
        isFeatured: false,
        key: "Cash Deposit Transactions-2-Deposit to Other Account",
      },
      {
        type: "cheque",
        title: "Cheque Deposit",
        subtitle: "Instant AI processing",
        categoryType: "Cheque Deposit Transactions",
        actionName: "Deposit to Other Account",
        typeId: 7,
        isBioRequired: true,
        iconBg: "#EBF2FE",
        arrowColor: "#5A6B87",
        isFeatured: false,
        key: "Cheque Deposit Transactions-7-Deposit to Other Account",
      },
      {
        type: "utility",
        title: "Bill Payment",
        subtitle: "Pay your bills with ease",
        categoryType: "Value Added Services",
        actionName: "Bill Payment",
        typeId: 8,
        isBioRequired: false,
        iconBg: "#EFEAFF",
        arrowColor: "#5A6B87",
        isFeatured: false,
        key: "Value Added Services-8-Bill Payment",
      },
    ];
  }

  trackByCardType(index: number, card: any): string {
    return card.key || index.toString();
  }

  updateHomeCards(): void {
    if (!this.transactionSections || !Array.isArray(this.transactionSections)) {
      return;
    }

    let totalTransactions = 0;
    for (const section of this.transactionSections) {
      if (section && Array.isArray(section.transactionTypes)) {
        totalTransactions += section.transactionTypes.length;
      }
    }

    const dynamicCards: any[] = [];
    const columns: any[] = [];
    let cashIndex = 0;
    let chequeIndex = 0;
    let vasIndex = 0;

    for (const section of this.transactionSections) {
      if (
        !section ||
        !Array.isArray(section.transactionTypes) ||
        section.transactionTypes.length === 0
      ) {
        continue;
      }

      const cat = (section.categoryType || "").toLowerCase();
      let columnType = "utility";
      let columnTitle = "Other Services";

      if (
        cat.includes("value") ||
        cat.includes("bill") ||
        cat.includes("utility") ||
        cat.includes("vas")
      ) {
        columnType = "utility";
        columnTitle = "Other Services";
      } else if (cat.includes("cheque")) {
        columnType = "cheque";
        columnTitle = "Cheque Services";
      } else {
        columnType = "cash";
        columnTitle = "Cash Services";
      }

      const sectionCards: any[] = [];

      for (let i = 0; i < section.transactionTypes.length; i++) {
        const txn = section.transactionTypes[i];
        if (!txn) continue;

        let cardType = columnType;
        let iconBg = "#EFEAFF";
        let title = "";
        let subtitle = "";

        const txnType = (txn.transactionType || "").toLowerCase();
        const action = (txn.actionName || "").toLowerCase();
        const typeName = (txn.transactionTypeName || "").toLowerCase();

        // Categorize card type (check utility/VAS first so cash sub-types within VAS aren't miscategorized)
        if (
          cat.includes("value") ||
          cat.includes("bill") ||
          cat.includes("utility") ||
          cat.includes("vas") ||
          action.includes("bill") ||
          action.includes("topup") ||
          typeName.includes("bill") ||
          typeName.includes("utility") ||
          typeName.includes("topup")
        ) {
          cardType = "utility";
          iconBg = "#EFEAFF";
        } else if (
          cat.includes("cheque") ||
          txnType.includes("cheque") ||
          typeName.includes("cheque")
        ) {
          cardType = "cheque";
          iconBg = "#EBF2FE";
        } else {
          cardType = "cash";
          iconBg = "#FFF0E6";
        }

        // Title and Subtitle assignment
        if (totalTransactions <= 3) {
          // Standard 3-card layout: keep canonical labels identical to Image 1
          if (cardType === "cash") {
            title = "Cash Deposit";
            subtitle = "Digitize your deposits";
          } else if (cardType === "cheque") {
            title = "Cheque Deposit";
            subtitle = "Instant AI processing";
          } else {
            title = "Bill Payment";
            subtitle = "Pay your bills with ease";
          }
        } else {
          // Responsive multi-transaction view:
          // Keep primary 3 transactions canonical, give all other transactions distinct, clear titles & subtitles
          if (cardType === "cash") {
            if (cashIndex === 0) {
              title = "Cash Deposit";
              subtitle = "Digitize your deposits";
            } else {
              if (action.includes("own") || typeName.includes("own")) {
                title = "Deposit to Own Account";
                subtitle = "Cash to your account";
              } else if (action.includes("interbank") || typeName.includes("interbank")) {
                title = "InterBank Deposit";
                subtitle = "Cash to other bank";
              } else if (action.includes("qr") || typeName.includes("qr")) {
                title = "QR Deposit";
                subtitle = "Cash via QR code";
              } else {
                title = txn.transactionTypeName || txn.actionName || "Cash Deposit";
                subtitle = "Digitize your deposits";
              }
            }
            cashIndex++;
          } else if (cardType === "cheque") {
            if (chequeIndex === 0) {
              title = "Cheque Deposit";
              subtitle = "Instant AI processing";
            } else {
              if (action.includes("teller") || typeName.includes("teller")) {
                title = "Cheque via Teller";
                subtitle = "Teller-assisted deposit";
              } else if (action.includes("own") || typeName.includes("own")) {
                title = "Cheque to Own Account";
                subtitle = "Cheque to your account";
              } else if (action.includes("other banks") || typeName.includes("other banks") || action.includes("other bank")) {
                title = "Deposit to Other Banks";
                subtitle = "Deposit to other banks";
              } else {
                title = txn.transactionTypeName || txn.actionName || "Cheque Deposit";
                subtitle = "Instant AI processing";
              }
            }
            chequeIndex++;
          } else {
            if (vasIndex === 0 && (action.includes("bill") || typeName.includes("bill") || cat.includes("bill") || cat.includes("value"))) {
              title = "Utility Bill Payment";
              subtitle = "Pay utility bills";
            } else if (action.includes("topup") || typeName.includes("topup")) {
              title = "Mobile Topup";
              subtitle = "Instant mobile recharge";
            } else {
              title = txn.transactionTypeName || txn.actionName || "Bill Payment";
              subtitle = "Pay your bills with ease";
            }
            vasIndex++;
          }
        }

        const uniqueKey = `${section.categoryType}-${txn.transactionTypeId}-${txn.actionName || i}`;

        const cardItem = {
          type: cardType,
          title: title,
          subtitle: subtitle,
          categoryType: section.categoryType,
          actionName: txn.actionName,
          typeId: txn.transactionTypeId,
          isBioRequired: !!txn.isBioRequired,
          iconBg: iconBg,
          arrowColor: "#5A6B87",
          isFeatured: false,
          key: uniqueKey,
        };

        dynamicCards.push(cardItem);
        sectionCards.push(cardItem);
      }

      if (sectionCards.length > 0) {
        columns.push({
          type: columnType,
          title: columnTitle,
          categoryType: section.categoryType,
          cards: sectionCards,
        });
      }
    }

    // Multi-card display pairing for 2-column balanced layout
    const multiGridCards: any[] = [];
    if (dynamicCards.length > 3) {
      const cashList = dynamicCards.filter((c) => c.type === "cash");
      const chequeList = dynamicCards.filter((c) => c.type === "cheque");
      const otherList = dynamicCards.filter(
        (c) => c.type !== "cash" && c.type !== "cheque"
      );

      if (cashList.length > 0 && chequeList.length > 0) {
        // Reorder cheque cards so conceptually paired rows match:
        // Row 1: Cash Deposit (Other Account) <-> Cheque Deposit (Other Account)
        // Row 2: Deposit to Own Account <-> Cheque to Own Account
        // Row 3: InterBank Deposit <-> Deposit to Other Banks
        // Row 4: QR Deposit <-> Cheque Deposit via teller
        const sortedCheque: any[] = [];
        const ownCheque = chequeList.find(
          (c) =>
            c.title.includes("Own") ||
            (c.actionName && c.actionName.toLowerCase().includes("own")),
        );
        const otherBanksCheque = chequeList.find(
          (c) =>
            c.title.includes("Other Banks") ||
            (c.actionName && c.actionName.toLowerCase().includes("other banks")),
        );
        const tellerCheque = chequeList.find(
          (c) =>
            c.title.includes("teller") ||
            (c.actionName && c.actionName.toLowerCase().includes("teller")),
        );
        const primaryCheque =
          chequeList.find(
            (c) =>
              c !== ownCheque && c !== otherBanksCheque && c !== tellerCheque,
          ) || chequeList[0];

        if (primaryCheque) sortedCheque.push(primaryCheque);
        if (ownCheque) sortedCheque.push(ownCheque);
        if (otherBanksCheque) sortedCheque.push(otherBanksCheque);
        if (tellerCheque) sortedCheque.push(tellerCheque);

        for (const ch of chequeList) {
          if (!sortedCheque.includes(ch)) sortedCheque.push(ch);
        }

        const leftCol: any[] = [...cashList];
        const rightCol: any[] =
          sortedCheque.length > 0 ? sortedCheque : [...chequeList];

        // Distribute otherList (VAS) evenly
        for (let i = 0; i < otherList.length; i++) {
          if (leftCol.length <= rightCol.length) {
            leftCol.push(otherList[i]);
          } else {
            rightCol.push(otherList[i]);
          }
        }

        const maxLen = Math.max(leftCol.length, rightCol.length);
        for (let r = 0; r < maxLen; r++) {
          if (r < leftCol.length) multiGridCards.push(leftCol[r]);
          if (r < rightCol.length) multiGridCards.push(rightCol[r]);
        }
      } else {
        const half = Math.ceil(dynamicCards.length / 2);
        for (let r = 0; r < half; r++) {
          if (r < dynamicCards.length) multiGridCards.push(dynamicCards[r]);
          if (r + half < dynamicCards.length)
            multiGridCards.push(dynamicCards[r + half]);
        }
      }
    }

    this.homeCards = dynamicCards;
    this.displayMultiCards =
      multiGridCards.length > 0 ? multiGridCards : dynamicCards;
    this.cashCards = dynamicCards.filter((c) => c.type === "cash");
    this.chequeCards = dynamicCards.filter((c) => c.type === "cheque");
    this.otherCards = dynamicCards.filter(
      (c) => c.type !== "cash" && c.type !== "cheque"
    );
    this.homeColumns = columns;
  }

  getHomeCards(): any[] {
    return this.homeCards;
  }

  private currentIndex = 0;
  private interval: any;

  @ViewChild("usefulSwiper", { static: false }) usefulSwiper: SwiperComponent;

  ngAfterViewInit(): void {
    ApplicationData.perefernces.transactionPerformed = false;
    this.btnIsBusy = false;
    this.selectedCardKey = "";
  }

  constructor(
    private sanitizer: DomSanitizer,
    private _router: Router,
    private apiResponse: WebResponseService,
    private initService: Initializer,
    private mock: MockService,
    private util: AppComponent,
    private dataService: DataService,
  ) {
    this.componentLabeling = ApplicationData.labeling.transaction_review;
    this.form_direction =
      ApplicationData.labeling.localization.settings.direction;
    localStorage.setItem("refreshed", "idle");

    ApplicationData.perefernces.inservice = true;

    this.apiResponse
      .getTransactionCategoryMapping()
      .subscribe(async (response: any) => {
        consoleLog(
          "home.component.ts",
          "Response Transaction Category Mapping",
          response,
        );
        this.transactionSections = response && response["data"] ? response["data"] : [];
        this.updateHomeCards();
        this.cardsReady = true;
        setTimeout(() => {
          this.transactionSwiper = new Swiper(".transaction-swiper", {
            loop: false, // Enable infinite loop
            spaceBetween: 18, // Space between slides
            slidesPerView: 3, // Number of slides per view
          });
        }, 1000);
      }, () => {
        // If API fails, show cards with default text rather than being stuck blank
        if (this.homeCards.length === 0) {
          this.homeCards = this.getDefaultHomeCards();
        }
        this.cardsReady = true;
      });
    this.initService.stopMonitoring();
  }

  ngOnInit(): void {
    this.updateHomeCards();
    ApplicationData.perefernces.lastServiceStatus = "IN SERVICE";
    if (ApplicationData.sessionTransaction.systemreferencenumber == "") {
      this.dataService.subject.next("In service\n\n");
    }

    // this.util.spinnerStart("Loading");
    // setTimeout(() => {
    //   this.util.spinnerStop();
    // }, 1000);

    this.currentDate = new Date();
    this.dateTimeTimer = setInterval(() => {
      this.currentDate = new Date();
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.dateTimeTimer) {
      clearInterval(this.dateTimeTimer);
    }
    this.util.spinnerStop();
  }

  // ngOnDestroy() {
  //   if (this.spinner != null) {
  //     this.spinnerService.stop(this.spinner);
  //   }
  //   this.util.spinnerStop();
  // }

  startAutoplay(): void {
    this.interval = setInterval(() => {
      this.slideToNext();
    }, 3000); // Adjust autoplay interval as needed (in milliseconds)
  }

  stopAutoplay(): void {
    clearInterval(this.interval);
  }

  slideToNext(): void {
    this.currentIndex++;
    this.updateSliderPosition();
  }

  updateSliderPosition(): void {
    const itemWidth = document.querySelector(".item")?.clientWidth || 0;
    const bannersWrapper = document.querySelector(".banners-wrapper");

    if (bannersWrapper) {
      const totalSlides = this.slides.length;

      // Calculate the offset for the current index
      const offset = -1 * this.currentIndex * itemWidth;
      bannersWrapper.setAttribute(
        "style",
        `transform: translateX(${offset}px); transition: transform 0.5s ease;`,
      );

      // Reset to the first slide (without transition) if it's the duplicate
      if (this.currentIndex === totalSlides) {
        setTimeout(() => {
          bannersWrapper.setAttribute(
            "style",
            `transform: translateX(0px); transition: none;`,
          );
          this.currentIndex = 0; // Reset to the first slide
        }, 300); // Match the transition duration
      }
    }
  }

  slideTo(index: number): void {
    this.currentIndex = index;
    this.updateSliderPosition();
  }

  @LogMethod
  btnTransaction(categoryType, actionLabel, typeId, bioRequired) {
    if (this.btnIsBusy) return; // Prevent function execution if busy

    this.btnIsBusy = true;
    this.selectedCardKey = categoryType + "-" + typeId + "-" + actionLabel;
    setTimeout(() => {
      this.btnIsBusy = false;
      this.selectedCardKey = "";
    }, 2500);

    console.log(categoryType);
    console.log(actionLabel);
    console.log(typeId);
    console.log(bioRequired);
    this.initTransaction.bioRequired = bioRequired;

    setTimeout(() => {
      this.dataService.subject.next("Transaction Started");
      if (categoryType.includes("Cash")) {
        ApplicationData.sessionTransaction.depositorRequired = "cash";
        setDepositMethod(ApplicationData.depositMethods._CASH);
        setTimeout(() => {
          this.dataService.subject.next("Transaction: Cash " + actionLabel);
        }, 1000);
      } else if (categoryType.includes("Cheque")) {
        ApplicationData.sessionTransaction.depositorRequired = "cheque";
        if (ApplicationData.customer.collectedAmount > 0) {
          this.btnIsBusy = false;
          this.selectedCardKey = "";
          this.util.dialog(
            "Sorry!",
            "You can only perform cash transactions to utilize remaining amount in wallet",
            ApplicationData.dialogType._MESSAGE,
            ApplicationData.dialogIcon._ERROR,
            (res: any) => {
              // Your callback logic here
            },
          );

          return;
        }
        setTimeout(() => {
          this.dataService.subject.next("Transaction: Cheque " + actionLabel);
        }, 1000);
        setDepositMethod(ApplicationData.depositMethods._CHEQUE);
      }

      ApplicationData.sessionTransaction.biometricRequired = bioRequired;
      switch (actionLabel) {
        case "Deposit to Own Account":
          setTransactionType(typeId);
          setTransactiontTitle(actionLabel);
          ApplicationData.sessionTransaction.startingComponent =
            "transaction-input";
          this.continueTransaction();
          break;

        case "Deposit to Other Account":
          setTransactionType(typeId);
          setTransactiontTitle(actionLabel);
          ApplicationData.sessionTransaction.startingComponent =
            "transaction-input";
          this.continueTransaction();
          break;

        case "Cheque Deposit via teller":
          setTransactionType(typeId);
          setTransactiontTitle(actionLabel);
          ApplicationData.sessionTransaction.startingComponent =
            "transaction-input";
          this.continueTransaction();
          break;

        case "Deposit to InterBank Account":
          setTransactionType(typeId);
          setTransactiontTitle(actionLabel);
          ApplicationData.sessionTransaction.startingComponent =
            "transaction-input";
          this.continueTransaction();
          break;

        case "QR Deposit":
          setTransactionType(typeId);
          setTransactiontTitle(actionLabel);
          ApplicationData.sessionTransaction.startingComponent =
            "transaction-input";
          this.continueTransaction();
          break;

        case "Bill Payment":
          setDepositMethod(ApplicationData.depositMethods._CASH_BILL_PAYMENT);
          this.dataService.subject.next("Transaction: Cash " + actionLabel);
          setTransactionType(typeId);
          setTransactiontTitle(actionLabel);
          ApplicationData.sessionTransaction.startingComponent = "utility-bill";
          this.continueTransaction();
          break;

        case "Mobile Topup":
          setDepositMethod(
            ApplicationData.depositMethods._CASH_VAS_MOBILE_TOPUP,
          );
          this.dataService.subject.next("Transaction: Cash " + actionLabel);
          setTransactionType(typeId);
          setTransactiontTitle(actionLabel);
          ApplicationData.sessionTransaction.startingComponent = "mobile-topup";
          this.continueTransaction();
          break;

        case "Deposit to Other Banks":
          setTransactionType(typeId);
          setTransactiontTitle(actionLabel);
          ApplicationData.sessionTransaction.startingComponent =
            "transaction-input";
          this.continueTransaction();
          break;

        default:
          this.util.dialog(
            WebResponseService.messages.msg_transaction_unavailable.heading,
            WebResponseService.messages.msg_transaction_unavailable.message,
            ApplicationData.dialogType._MESSAGE,
            ApplicationData.dialogIcon._ERROR,
            (res) => {},
          );

          break;
      }
    }, 500);
  }

  // @LogMethod
  // continueTransaction() {

  //   // this.spinner = this.spinnerService.start(WebResponseService.messages.msg_loading_start_cash_transaction.message);
  //   this.util.spinnerStart(WebResponseService.messages.msg_loading_start_cash_transaction.message);

  //   stopStatusService();
  //   initializeEnvironment(this.apiResponse, this.dataService, (envoirnmentResponse) => {
  //     this.util.spinnerStop();

  //     if (envoirnmentResponse == undefined && envoirnmentResponse == false) {
  //       this._router.navigate(['out-of-service']);
  //     }

  //     if (sessionStorage.getItem("checkEnvironment") == "21") {
  //       this.dataService.subject.next("NETWORK FAILED");
  //       this._router.navigate(['out-of-service']);
  //       sessionStorage.removeItem("checkEnvironment");
  //       return;
  //     }

  //     if (sessionStorage.getItem("checkEnvironment") == "13") {
  //       this.dataService.subject.next("ERROR GETTING AUTHORIZED DENOMINATIONS");
  //       this.util.dialog(WebResponseService.messages.msg_err_proc_cash_transaction.heading, WebResponseService.messages.msg_err_proc_cash_transaction.message, ApplicationData.dialogType._MESSAGE, ApplicationData.dialogIcon._ERROR, res => {
  //         sessionStorage.removeItem("checkEnvironment");
  //       });
  //       return;
  //     }
  //     this.apiResponse.getPaymentPurposeOptions(getTransactionType()).subscribe((responsePurposes) => {
  //       this.util.spinnerStop();
  //       consoleLog("home.component.ts", "Response Payment Purpose Options", responsePurposes);
  //       if (responsePurposes['statusCode'] != "00") {
  //         //    this.spinnerService.stop(this.spinner);
  //         this.util.spinnerStop();
  //         //    this.errorDialog("Error", responsePurposes['responseMessage']);
  //         this.util.dialog("Oops!", responsePurposes['responseMessage'], ApplicationData.dialogType._MESSAGE, ApplicationData.dialogIcon._ERROR, res => { });
  //         this.dataService.subject.next("Error in Getting Purposes List");
  //       }
  //       else {
  //         ApplicationData.sessionTransaction.transactionPurposeList = responsePurposes['data'];
  //         //   let response = sessionStorage.getItem("checkEnvironment");

  //         if (envoirnmentResponse !== undefined && envoirnmentResponse === true) {
  //           sessionStorage.removeItem("checkEnvironment");
  //           // this.spinnerService.stop(spinnerRef);
  //           document.querySelector(".fixed-header")?.classList.remove("slide-in");
  //           document.querySelector(".lang-selected-div")?.classList.add("slide-in-top");

  //           const depositMethod = getDepositMethod();
  //           const transactionTitle = getTransactiontTitle();

  //           if (depositMethod === ApplicationData.depositMethods._CASH) {
  //             if (transactionTitle === "Deposit to Other Account") {
  //                 this._router.navigate(['cash-deposit-other']);
  //             } else if (transactionTitle === "Deposit to Own Account") {
  //                 this._router.navigate(['cash-deposit-own']);
  //             }
  //             else if (transactionTitle === "QR Deposit") {
  //               this._router.navigate(['qr-deposit']);
  //           } else if (transactionTitle === "Deposit to InterBank Account") {
  //               this._router.navigate(['cash-deposit-interbank']);
  //           }
  //         } else if (depositMethod === ApplicationData.depositMethods._CHEQUE) {
  //             if (transactionTitle === "Deposit to Other Account") {
  //                 this._router.navigate(['cheque-deposit-other']);
  //             } else if (transactionTitle === "Deposit to Own Account") {
  //                 this._router.navigate(['cheque-deposit-own']);
  //             }
  //         } else if (depositMethod === ApplicationData.depositMethods._CASH_BILL_PAYMENT) {
  //             if (transactionTitle === "Bill Payment") {
  //                 this._router.navigate(['utility-bill']);
  //             }
  //         } else if (depositMethod === ApplicationData.depositMethods._CASH_VAS_MOBILE_TOPUP) {
  //             if (transactionTitle === "Mobile Topup") {
  //                 this._router.navigate(['mobile-topup']);
  //             }
  //         }

  //           console.log(transactionTitle);
  //       } else {
  //           this.util.dialog(
  //               WebResponseService.messages.msg_err_terminal_init.heading,
  //               WebResponseService.messages.msg_err_terminal_init.message,
  //               ApplicationData.dialogType._MESSAGE,
  //               ApplicationData.dialogIcon._ERROR,
  //               res => {}
  //           );
  //           console.log("Environment Initialization Failed");
  //           this.dataService.subject.next("OFFLINE");
  //           this._router.navigate(['out-of-service']);
  //       }

  //       }
  //     }, err => {
  //       //  this.spinnerService.stop(this.spinner);
  //       this.util.spinnerStop();
  //       this.util.dialog(WebResponseService.messages.msg_err_proc_cash_transaction.heading, WebResponseService.messages.msg_err_proc_cash_transaction.message, ApplicationData.dialogType._MESSAGE, ApplicationData.dialogIcon._ERROR, res => {
  //         this.dataService.subject.next("OFFLINE");
  //         this._router.navigate(['out-of-service']);
  //       });
  //     });
  //   });
  // }

  @LogMethod
  continueTransaction() {
    this.util.spinnerStart(
      WebResponseService.messages.msg_loading_start_cash_transaction.message,
    );

    stopStatusService();
    initializeEnvironment(
      this.apiResponse,
      this.dataService,
      (envoirnmentResponse) => {
        //this.util.spinnerStop();

        if (envoirnmentResponse == undefined && envoirnmentResponse == false) {
          this._router.navigate(["out-of-service"]);
        }

        if (sessionStorage.getItem("checkEnvironment") == "21") {
          this.dataService.subject.next("NETWORK FAILED");
          this._router.navigate(["out-of-service"]);
          sessionStorage.removeItem("checkEnvironment");
          return;
        }

        if (sessionStorage.getItem("checkEnvironment") == "13") {
          this.dataService.subject.next(
            "ERROR GETTING AUTHORIZED DENOMINATIONS",
          );
          this.util.dialog(
            WebResponseService.messages.msg_err_proc_cash_transaction.heading,
            WebResponseService.messages.msg_err_proc_cash_transaction.message,
            ApplicationData.dialogType._MESSAGE,
            ApplicationData.dialogIcon._ERROR,
            (res) => {
              sessionStorage.removeItem("checkEnvironment");
            },
          );
          return;
        }

        this.apiResponse
          .getPaymentPurposeOptions(getTransactionType())
          .subscribe(
            (responsePurposes) => {
              //this.util.spinnerStop();
              console.log(
                "home.component.ts",
                "Response Payment Purpose Options",
                responsePurposes,
              );

              if (responsePurposes["statusCode"] !== "00") {
                this.util.spinnerStop();
                this.util.dialog(
                  "Oops!",
                  responsePurposes["responseMessage"],
                  ApplicationData.dialogType._MESSAGE,
                  ApplicationData.dialogIcon._ERROR,
                  (res) => {},
                );
                this.dataService.subject.next("Error in Getting Purposes List");
              } else {
                ApplicationData.sessionTransaction.transactionPurposeList =
                  responsePurposes["data"];
                console.log(
                  ApplicationData.sessionTransaction.transactionPurposeList,
                );

                // Your exact requested code block here:
                //this.util.spinnerStart("");
                this.apiResponse
                  .getTransactionImageEvent()
                  .subscribe((responseImageEvents) => {
                    console.log("Image Events", responseImageEvents);
                    this.util.spinnerStop();
                    if (responseImageEvents["statusCode"] !== "00") {
                      this.util.spinnerStop();
                      this.util.dialog(
                        "Oops!",
                        responseImageEvents["responseMessage"],
                        ApplicationData.dialogType._MESSAGE,
                        ApplicationData.dialogIcon._ERROR,
                        (res) => {},
                      );
                      this.dataService.subject.next(
                        "Error in Getting Transaction Image Events",
                      );
                    } else {
                      ApplicationData.sessionTransaction.transactionImageEvents =
                        responseImageEvents["data"];
                      console.log(
                        ApplicationData.sessionTransaction
                          .transactionImageEvents,
                      );

                      if (
                        envoirnmentResponse !== undefined &&
                        envoirnmentResponse === true
                      ) {
                        sessionStorage.removeItem("checkEnvironment");
                        document
                          .querySelector(".fixed-header")
                          ?.classList.remove("slide-in");
                        document
                          .querySelector(".lang-selected-div")
                          ?.classList.add("slide-in-top");

                        const depositMethod = getDepositMethod();
                        const transactionTitle = getTransactiontTitle();

                        if (
                          depositMethod === ApplicationData.depositMethods._CASH
                        ) {
                          if (transactionTitle === "Deposit to Other Account") {
                            this._router.navigate(["cash-deposit-other"]);
                          } else if (
                            transactionTitle === "Deposit to Own Account"
                          ) {
                            this._router.navigate(["cash-deposit-own"]);
                          } else if (transactionTitle === "QR Deposit") {
                            this._router.navigate(["qr-deposit"]);
                          } else if (
                            transactionTitle === "Deposit to InterBank Account"
                          ) {
                            this._router.navigate(["cash-deposit-interbank"]);
                          }
                        } else if (
                          depositMethod ===
                          ApplicationData.depositMethods._CHEQUE
                        ) {
                          if (transactionTitle === "Deposit to Other Account") {
                            this._router.navigate(["cheque-deposit-other"]);
                          } else if (
                            transactionTitle === "Deposit to Own Account"
                          ) {
                            this._router.navigate(["cheque-deposit-own"]);
                          } else if (
                            transactionTitle === "Cheque Deposit via teller"
                          ) {
                            this._router.navigate(["cheque-deposit-teller"]);
                          }
                        } else if (
                          depositMethod ===
                          ApplicationData.depositMethods._CASH_BILL_PAYMENT
                        ) {
                          if (transactionTitle === "Bill Payment") {
                            this._router.navigate(["utility-bill"]);
                          }
                        } else if (
                          depositMethod ===
                          ApplicationData.depositMethods._CASH_VAS_MOBILE_TOPUP
                        ) {
                          if (transactionTitle === "Mobile Topup") {
                            this._router.navigate(["mobile-topup"]);
                          }
                        }

                        console.log(transactionTitle);
                      } else {
                        this.util.dialog(
                          WebResponseService.messages.msg_err_terminal_init
                            .heading,
                          WebResponseService.messages.msg_err_terminal_init
                            .message,
                          ApplicationData.dialogType._MESSAGE,
                          ApplicationData.dialogIcon._ERROR,
                          (res) => {},
                        );
                        console.log("Environment Initialization Failed");
                        this.dataService.subject.next("OFFLINE");
                        this._router.navigate(["out-of-service"]);
                      }
                    }
                  });
              }
            },
            (err) => {
              this.util.spinnerStop();
              this.util.dialog(
                WebResponseService.messages.msg_err_proc_cash_transaction
                  .heading,
                WebResponseService.messages.msg_err_proc_cash_transaction
                  .message,
                ApplicationData.dialogType._MESSAGE,
                ApplicationData.dialogIcon._ERROR,
                (res) => {
                  this.dataService.subject.next("OFFLINE");
                  this._router.navigate(["out-of-service"]);
                },
              );
            },
          );
      },
    );
  }

  @LogMethod
  navigateToScreen(componentPath: string) {
    if (
      !ApplicationData.perefernces.superUser &&
      !ApplicationData.perefernces.sensorWarning
    ) {
      this._router.navigate([componentPath]);
    }
  }

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

  recieveImage(data: WebcamImage) {
    this.webcamImage = data;
  }

  @LogMethod
  biometricError() {
    this.util.dialog(
      WebResponseService.messages.msg_err_proc_req.heading,
      WebResponseService.messages.msg_err_proc_req.message,
      ApplicationData.dialogType._MESSAGE,
      null,
      (res) => {},
    );
  }

  @LogMethod
  checkTransactionsCount(count: any): any {
    if (count >= 3) {
      return 3;
    } else {
      return count;
    }
  }

  spinnerStop() {
    this.util.spinnerStop();
  }

  writeEJ(data: any) {
    this.dataService.subject.next(data);
  }

  formatCategoryType(categoryType: string): string {
    if (!categoryType) return ""; // Handle edge case

    // Split categoryType into words
    const words = categoryType.split(" ");

    // Ensure there are words to format
    if (words.length > 0) {
      // Bold the first word using HTML
      const formattedCategoryType = `<b>${words[0]}</b> ${words.slice(1).join(" ")}`;

      // Sanitize and return as trusted HTML
      return this.sanitizer.bypassSecurityTrustHtml(
        formattedCategoryType,
      ) as string;
    }

    return categoryType; // Return original if no words found
  }

  getSectionBadgeIcon(categoryType: string): string {
    const cat = (categoryType || "").toLowerCase();
    if (cat.includes("cash")) {
      return "assets/img/home-icons/badge-cash.png";
    } else if (cat.includes("cheque")) {
      return "assets/img/home-icons/badge-cheque.png";
    } else {
      return "assets/img/home-icons/badge-vas.png";
    }
  }

  getTransactionIcon(
    categoryType: string,
    actionName: string,
    typeName: string,
  ): string {
    const cat = (categoryType || "").toLowerCase();
    const action = ((actionName || "") + " " + (typeName || "")).toLowerCase();

    if (cat.includes("cash")) {
      if (action.includes("own")) {
        return "assets/img/home-icons/icon-own.png";
      } else if (action.includes("merchant") || action.includes("interbank")) {
        return "assets/img/home-icons/icon-merchant.png";
      } else {
        return "assets/img/home-icons/icon-cash-other.png";
      }
    } else if (cat.includes("cheque")) {
      if (action.includes("own")) {
        return "assets/img/home-icons/icon-own.png";
      } else if (action.includes("teller")) {
        return "assets/img/home-icons/icon-cheque-teller.png";
      } else if (action.includes("merchant")) {
        return "assets/img/home-icons/icon-merchant.png";
      } else {
        return "assets/img/home-icons/icon-cheque-other.png";
      }
    } else {
      // Value Added Services
      if (action.includes("mobile") || action.includes("topup")) {
        return "assets/img/home-icons/icon-mobile-topup.png";
      } else {
        return "assets/img/home-icons/icon-bill-payment.png";
      }
    }
  }
}
