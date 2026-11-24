// From Now On we will be using Only
// production_TWARE
// production_QServices
// And not this  "production_TAgent": false
import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { WebServices } from "./webservices";
import { ApplicationData } from "./classes/application";
import {
  getAccountNumber,
  getAccountTitle,
  getApplicationUser,
  getDepositMethod,
  getEnteredAmount,
  getMobileNumber,
  getTransactionData,
  getTransactionNumber,
  getTransactionPurposeId,
  getTransactionStatus,
  getTransactiontTitle,
  getTransactionType,
  APICallLogger,
  methodCalls,
  consoleLog,
  getCDMReferenceNumber,
  getChequeNo,
  getbillingCompanyId,
  getbillingCompanyCode,
  getbankId,
  getbankIMD,
  setTransactionStatus,
} from "./classes/GlobalFunctions";
import { ConnectionPositionPair } from "@angular/cdk/overlay";
import { MockService } from "./classes/MockService/mock-service.service";
import { MaskPipe } from "./Pipes/Maskings";

@Injectable({
  providedIn: "root",
})
export class WebResponseService {
  static settings: any;
  static messages: any;
  TWARE_http: any;
  QServices_http: any;
  localProduction: boolean = true;

  constructor(
    private http: HttpClient,
    private mock: MockService,
    private masking: MaskPipe,
  ) {}

  @APICallLogger
  public getConfiguration() {
    return this.http.get("assets/app_constants.json");
  }

  @APICallLogger
  public getAppMessages() {
    return this.http.get("assets/app-messages.json");
  }

  @APICallLogger
  public terminalAuthentication() {
    // token > services
    methodCalls("call terminalAuthentication");

    if (WebResponseService.settings.production_QServices == true) {
      return this.http.post(
        WebServices.terminalAuth,
        this.setQServices_sender(),
      );
    } else {
      methodCalls("Mocking terminalAuthentication");
      return this.http.get(
        "https://mocki.io/v1/d4fbe6c0-65d4-4c03-9816-2000c97e5305",
      );
    }
  }

  @APICallLogger
  public getPaymentPurposeOptions(transactionTypeId) {
    methodCalls("call getPaymentPurposeOptions");

    let body = {
      transactionTypeId: transactionTypeId,
      Sender: {
        ...this.setQServices_sender(),
      },
    };

    if (WebResponseService.settings.production_QServices == true) {
      return this.http.post(
        WebServices.paymentPurposes,
        body,
        this.setQServices_Header(),
      );
    } else {
      methodCalls("Mocking getPaymentPurposeOptions");
      // return this.http.get("https://mocki.io/v1/c43c412e-65cc-452d-8c88-0c0c06f9916c");
      return this.mock.GetPaymentPurposes();
    }
  }

  @APICallLogger
  public getBiometricCapture() {
    methodCalls("call getBiometricCapture");

    if (WebResponseService.settings.production_TWARE == true) {
      return this.http.post(
        WebServices.bioMetricService,
        {},
        this.setTWARE_Header(),
      );
    } else {
      methodCalls("Mocking getBiometricCapture");
      //  return this.http.get("https://mocki.io/v1/d50eb6ab-6f21-4177-80a3-6fd38a77ac0f");
      return this.mock.CaptureBiometric();
    }
  }

  @APICallLogger
  public getNadraVerification(fpISO: string, customerCNIC: string) {
    if (WebResponseService.settings.production_QServices == true) {
      let body = {
        CitizenNumber: customerCNIC,
        BiometricISO: fpISO,
        SystemReferenceNumber:
          ApplicationData.sessionTransaction.systemreferencenumber,
        Sender: {
          ...this.setQServices_sender(),
        },
      };

      methodCalls(body);

      return this.http.post(
        WebServices.verifyBiometric,
        body,
        this.setQServices_Header(),
      );
    } else {
      methodCalls("Mocking getNadraVerification");

      //     return this.http.get("https://mocki.io/v1/d4fbe6c0-65d4-4c03-9816-2000c97e5305");
      return this.mock.NadraVertification();
    }
  }

  @APICallLogger
  public getAccountTitle(accountNumber: string) {
    methodCalls("call getAccountTitle");

    if (WebResponseService.settings.production_QServices == true) {
      let body = {
        CitizenNumber: ApplicationData.customer.CNIC,
        AccountNumber: accountNumber,
        bankId: getbankId(),
        bankIMD: getbankIMD(),
        SystemReferenceNumber:
          ApplicationData.sessionTransaction.systemreferencenumber,
        Sender: {
          ...this.setQServices_sender(),
        },
      };
      console.log("Request Body:", body);
      return this.http.post(
        WebServices.fetchAccountTitle,
        body,
        this.setQServices_Header(),
      );
    } else {
      methodCalls("Mocking getAccountTitle");
      return this.mock.FetchAccountTitle();
    }
  }

  @APICallLogger
  public getOwnAccountsList(cnicValue) {
    methodCalls("call getOwnAccountsList");

    if (WebResponseService.settings.production_QServices == true) {
      let body = {
        CitizenNumber: cnicValue,
        Sender: {
          ...this.setQServices_sender(),
        },
      };
      return this.http.post(
        WebServices.getAccountsList,
        body,
        this.setQServices_Header(),
      );
    } else {
      methodCalls("Mocking getOwnAccountsList");
      // return this.http.get("https://mocki.io/v1/f28ed118-bbc3-4119-8a2a-46190c40a991");
      return this.mock.GetOwnAccountsList();
    }
  }

  @APICallLogger
  public acceptorStack() {
    methodCalls("call acceptorStack");
    let denom: any;
    if (sessionStorage.getItem("currentDenom")) {
      denom = JSON.parse(String(sessionStorage.getItem("currentDenom")));
    } else {
      denom = [];
    }

    console.log("acceptorStack denom");
    console.log(denom);
    if (WebResponseService.settings.production_TWARE == true) {
      return this.http.post(
        WebServices.acceptorStack,
        denom,
        this.setTWARE_Header(),
      );
    } else {
      methodCalls("Mocking acceptorStack");
      return this.mock.StackCash();
    }
  }

  public acceptorAcceptCash() {
    methodCalls("call acceptorAcceptCash");
    if (WebResponseService.settings.production_TWARE == true) {
      return this.http.post(
        WebServices.acceptorAcceptCash,
        ApplicationData.sessionTransaction.authorizedDenominations,
        this.setTWARE_Header(),
      );
    } else {
      methodCalls("Mocking acceptorAcceptCash");
      return this.mock.AcceptCash();
    }
  }

  @APICallLogger
  public chequeCheckEntry() {
    methodCalls("call chequeCheckEntry");
    if (WebResponseService.settings.production_TWARE == true) {
      return this.http.post(
        WebServices.acceptorCheckCheque,
        {},
        this.setTWARE_Header(),
      );
    } else {
      methodCalls("Mocking chequeCheckEntry");
      return this.mock.ChequeEntry();
    }
  }

  @APICallLogger
  public chequeScan() {
    methodCalls("call chequeScan");
    if (WebResponseService.settings.production_TWARE == true) {
      return this.http.post(
        WebServices.acceptorScanCheque,
        {},
        this.setTWARE_Header(),
      );
    } else {
      methodCalls("Mocking chequeScan");

      return this.mock.ChequeScan();
    }
  }

  @APICallLogger
  public chequeDeposit() {
    methodCalls("call chequeDeposit");
    if (WebResponseService.settings.production_TWARE == true) {
      return this.http.post(
        WebServices.acceptorDepositCheque,
        {},
        this.setTWARE_Header(),
      );
    } else {
      methodCalls("Mocking chequeDeposit");
      return this.mock.DepositCheque();
    }
  }

  @APICallLogger
  public chequeCancel() {
    methodCalls("call chequeCancel");
    if (WebResponseService.settings.production_TWARE == true) {
      return this.http.post(
        WebServices.acceptorCancelCheque,
        {},
        this.setTWARE_Header(),
      );
    } else {
      methodCalls("Mocking chequeCancel");
      return this.mock.CancelCheque();
    }
  }

  @APICallLogger
  public acceptorRejectCash() {
    methodCalls("call acceptorOpenShutter");

    let denom: any;
    if (sessionStorage.getItem("currentDenom")) {
      denom = JSON.parse(String(sessionStorage.getItem("currentDenom")));
    } else {
      denom = [];
    }

    let body = {
      Denominations: denom,
    };

    if (WebResponseService.settings.production_TWARE == true) {
      return this.http.post(
        WebServices.acceptorRejectCash,
        body,
        this.setTWARE_Header(),
      );
    } else {
      methodCalls("Mocking acceptorOpenShutter");
      return this.mock.RejectCash();
    }
  }

  @APICallLogger
  public openCloseDropdoor(opening: any) {
    methodCalls("call openCloseDropdoor");
    let denom: any;
    if (sessionStorage.getItem("currentDenom")) {
      denom = JSON.parse(String(sessionStorage.getItem("currentDenom")));
    } else {
      denom = [];
    }

    let body = {
      dropdoor_openclose: opening,
      Denominations: denom,
    };
    if (WebResponseService.settings.production_TWARE == true) {
      return this.http.post(
        WebServices.acceptorOpenCloseDropDoor,
        body,
        this.setTWARE_Header(),
      );
    } else {
      methodCalls("Mocking openCloseDropdoor");
      return this.mock.OpenCloseDropdoor();
    }
  }

  @APICallLogger
  public printCollectCashReceipt() {
    methodCalls("call printCollectCashReceipt");

    let body = {
      Heading1: " COUNTER COLLECTION",
      "Depositor CNIC #": ApplicationData.customer.CNIC,
      "Collection Amount": ApplicationData.customer.collectedAmount,
    };
  }

  @APICallLogger
  public printTransactionReceipt() {
    methodCalls("call printTransactionReceipt");
    let printAmount;

    if (
      getDepositMethod() === ApplicationData.depositMethods._CASH ||
      getDepositMethod() ===
        ApplicationData.depositMethods._CASH_BILL_PAYMENT ||
      getDepositMethod() ===
        ApplicationData.depositMethods._CASH_VAS_MOBILE_TOPUP
    ) {
      printAmount = sessionStorage.getItem("currentAmount");
    } else if (getDepositMethod() === ApplicationData.depositMethods._CHEQUE) {
      printAmount = getEnteredAmount();
    }

    let body: any = {};
    if (getDepositMethod() === ApplicationData.depositMethods._CASH) {
      body = {
        "Branch Code": ApplicationData.config.branchCode,
        "Terminal Code": ApplicationData.config.deviceCode,
        "Depositor CNIC #": this.masking.transform(
          ApplicationData.customer.CNIC.replace(/-/g, ""),
        ),
        "Account Title": getAccountTitle(),
        "Beneficiary Account": this.masking.transform(getAccountNumber()),
        "Deposit Amount": "Rs. " + printAmount + "/-",
        "Transaction Type": "Cash Deposit",
      };
    } else if (getDepositMethod() === ApplicationData.depositMethods._CHEQUE) {
      body = {
        "Branch Code": ApplicationData.config.branchCode,
        "Terminal Code": ApplicationData.config.deviceCode,
        "Depositor CNIC #": this.masking.transform(
          ApplicationData.customer.CNIC.replace(/-/g, ""),
        ),
        "Account Title": getAccountTitle(),
        "Beneficiary Account": this.masking.transform(getAccountNumber()),
        "Entered Amount": "Rs. " + printAmount + "/-",
        "Transaction Type": "Cheque Deposit",
      };
    } else if (
      getDepositMethod() === ApplicationData.depositMethods._CASH_BILL_PAYMENT
    ) {
      body = {
        "Depositor CNIC #": this.masking.transform(
          ApplicationData.customer.CNIC.replace(/-/g, ""),
        ),
        "Account Title": getAccountTitle(),
        "Consumer/Account Number": getAccountNumber(),
        "Deposit Amount": "Rs. " + printAmount + "/-",
        "Transaction Type": "Utility Bill Payment",
        Denominations: sessionStorage.getItem("denomText"),
      };
    } else if (
      getDepositMethod() ===
      ApplicationData.depositMethods._CASH_VAS_MOBILE_TOPUP
    ) {
      body = {
        "Depositor CNIC #": this.masking.transform(
          ApplicationData.customer.CNIC.replace(/-/g, ""),
        ),
        "Mobile Number": getMobileNumber(),
        "Deposit Amount": "Rs. " + printAmount + "/-",
        "Transaction Type": "Mobile Topup",
        Denominations: sessionStorage.getItem("denomText"),
      };
    }

    if (getDepositMethod() === ApplicationData.depositMethods._CASH) {
      body = {
        ...body,
        Denominations: sessionStorage.getItem("denomText"),
      };
    } else if (getDepositMethod() === ApplicationData.depositMethods._CHEQUE) {
      body = {
        ...body,
        "Cheque #": getChequeNo(),
        ImageData: ApplicationData.sessionTransaction.chequeImage,
      };

      // Append parsed cheque fields to receipt if available
      const pcd = ApplicationData.sessionTransaction.parsedChequeData;
      if (ApplicationData.sessionTransaction.isChequeParsed && pcd) {
        const toTitleCase = (str: string) =>
          str
            ? str.replace(
                /\w\S*/g,
                (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(),
              )
            : str;
        if (pcd.bank_name) body["Issuer Bank"] = toTitleCase(pcd.bank_name);
        if (pcd.account_number)
          body["Issuer Account"] = this.masking.transform(
            String(pcd.account_number).replace(/\s+/g, ""),
          );
        if (pcd.payer) body["Issuer Name"] = toTitleCase(pcd.payer);
        if (pcd.payee) body["Beneficiary Name"] = toTitleCase(pcd.payee);
        if (pcd.date) body["Cheque Date"] = pcd.date;
        if (pcd.amount_in_number)
          body["Amount on Cheque"] = "Rs. " + pcd.amount_in_number;
        if (pcd.amount_in_words)
          body["Amount in Words"] = toTitleCase(pcd.amount_in_words);
      } else {
        setTransactionStatus("Processing");
      }
    }

    if (ApplicationData.sessionTransaction.isCashStuck) {
      if (ApplicationData.sessionTransaction.claimId) {
        body["Claim ID"] = ApplicationData.sessionTransaction.claimId;
      }
      if (ApplicationData.sessionTransaction.claimAmount) {
        body["Claim Amount"] =
          "Rs. " + ApplicationData.sessionTransaction.claimAmount + "/-";
      }
      if (ApplicationData.sessionTransaction.claimDenominations) {
        body["Claim Denominations"] =
          ApplicationData.sessionTransaction.claimDenominations.replace(
            /,\s+/g,
            ",",
          );
      }
    }

    body = {
      ...body,
      "Transaction Status": getTransactionStatus(),
    };

    if (getTransactionNumber() && getTransactionNumber() !== "NULL") {
      body = {
        ...body,
        "Transaction #": getTransactionNumber(),
      };
    }

    if (ApplicationData.sessionTransaction.systemreferencenumber) {
      body = {
        ...body,
        "Reference #": ApplicationData.sessionTransaction.systemreferencenumber,
      };
    }

    consoleLog("web-response.service.ts", "Requesting Receipt Print", body);
    if (WebResponseService.settings.production_TWARE) {
      return this.http.post(
        WebServices.receiptPrinter,
        body,
        this.setTWARE_Header(),
      );
    } else {
      methodCalls("Mocking printTransactionReceipt");
      return this.mock.PrintReceipt();
    }
  }

  @APICallLogger
  public printWalletReceipt() {
    let body: any = {};
    body = {
      "Remaining Amount":
        "Rs. " + ApplicationData.customer.collectedAmount + "/-",
      "Transaction Type": "Wallet",
      "Date and Time": new Date().toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    };

    consoleLog("web-response.service.ts", "Requesting Receipt Print", body);
    if (WebResponseService.settings.production_TWARE) {
      return this.http.post(
        WebServices.receiptPrinter,
        body,
        this.setTWARE_Header(),
      );
    } else {
      methodCalls("Mocking printTransactionReceipt");
      return this.mock.PrintReceipt();
    }
  }

  @APICallLogger
  public printRecieptBody(body: any) {
    methodCalls("call printRecieptBody");
    if (WebResponseService.settings.production_TWARE == true) {
      return this.http.post(
        WebServices.receiptPrinter,
        body,
        this.setTWARE_Header(),
      );
    } else {
      methodCalls("Mocking printRecieptBody");
      return this.mock.PrintReceipt();
    }
  }

  @APICallLogger
  public mockedPrint() {
    methodCalls("call mockedPrint");

    let body = {
      Title: "Touch Point",
      "Depositor CNIC #": "44444-44444444-4",
      "Transaction Type": "Deposit to own account",
      Denominations: "1000x1",
      "Amount Deposited": "15000",
    };
    methodCalls(body);
    if (WebResponseService.settings.production_TWARE == true) {
      return this.http.post(
        WebServices.receiptPrinter,
        body,
        this.setTWARE_Header(),
      );
    } else {
      methodCalls("Mocking mockedPrint");
      return this.http.get(
        "https://mocki.io/v1/0867a005-bd03-4852-81a5-0337cf5554bb",
      );
    }
  }

  @APICallLogger
  public getTransactionCategoryMapping() {
    methodCalls("call getTransactionCategoryMapping");
    if (WebResponseService.settings.production_QServices == true) {
      return this.http.get(WebServices.getTransactionSections);
      // return this.http.get("https://mocki.io/v1/922a5322-1750-4cd9-a3e6-3b2078f25d84");
    } else {
      // methodCalls("Mocking getTransactionCategoryMapping");
      //  return this.http.get("https://mocki.io/v1/78c09e90-c22c-4ac1-a1c9-72024e4d1e75");
      return this.mock.GetTransactionCategoryMapping();
    }
  }

  // @APICallLogger
  // public postTransactionImage(image: any) {
  //   console.log("call postTransactionImage");

  //   image = image.replace("data:image/jpeg;base64,", "");

  //   if (WebResponseService.settings.production_QServices == true) {
  //     let body = {
  //       "EventId": "",
  //       "SystemReferenceNumber": sessionStorage.getItem("TWARE_transactionId"),
  //       "CapturedImage": image,
  //       "Sender": {
  //         ... this.setQServices_sender()
  //       }
  //     }
  //     console.log("Post Transaction Image Body: ", body);
  //     return this.http.post(WebServices.postTransactionImage, body, this.setQServices_Header());
  //   }
  //   else {
  //     methodCalls("Mocking postTransactionImage");
  //     return this.mock.PostTransactionImage();
  //   }
  // }

  @APICallLogger
  public postTransactionImage(imageload: { image: string; eventId: string }) {
    console.log("call postTransactionImage");

    const imageData = imageload.image.replace("data:image/jpeg;base64,", "");

    if (WebResponseService.settings.production_QServices === true) {
      const body = {
        EventId: imageload.eventId,
        SystemReferenceNumber:
          ApplicationData.sessionTransaction.systemreferencenumber,
        CapturedImage: imageData,
        Sender: {
          ...this.setQServices_sender(),
        },
      };

      console.log("Post Transaction Image Body: ", body);
      return this.http.post(
        WebServices.postTransactionImage,
        body,
        this.setQServices_Header(),
      );
    } else {
      methodCalls("Mocking postTransactionImage");
      return this.mock.PostTransactionImage();
    }
  }

  @APICallLogger
  public getTransactionImageEvent() {
    let body = {
      RequestId: getTransactionType(),
      Sender: {
        SenderId: ApplicationData.perefernces.superUserId,
        ...this.setQServices_sender(),
      },
    };
    console.log("Body Image Events", body);
    if (WebResponseService.settings.production_TWARE == true) {
      return this.http.post(
        WebServices.imageEventList,
        body,
        this.setTWARE_Header(),
      );
    } else {
      return this.mock.transactionImageEvents();
    }
  }

  @APICallLogger
  public TWARE_startTransaction(actionName: any, parentTransactionId: any) {
    //token > tware
    methodCalls("call TWARE_startTransaction");
    let body = {
      action: actionName, // Deposit to Own
      language: "en", // en
      parentTransactionId: parentTransactionId,
      vendorKey: "",
      extra: {},
    };

    let response: any;
    if (WebResponseService.settings.production_TWARE == true) {
      //  this.postEJMessage("Opening TWare Transaction File").subscribe(res => {});

      if (getDepositMethod() == ApplicationData.depositMethods._CASH) {
        response = this.http.post(
          WebServices.startCashTransaction,
          body,
          this.setTWARE_Header(),
        );
      } else if (getDepositMethod() == ApplicationData.depositMethods._CHEQUE) {
        response = this.http.post(
          WebServices.startChequeTransaction,
          body,
          this.setTWARE_Header(),
        );
      } else if (
        getDepositMethod() == ApplicationData.depositMethods._CASH_BILL_PAYMENT
      ) {
        response = this.http.post(
          WebServices.startCashTransaction,
          body,
          this.setTWARE_Header(),
        );
      }
    } else {
      methodCalls("Mocking TWARE_startTransaction");
      // response = this.http.get("https://mocki.io/v1/bbee7025-8c3e-49b2-a4b6-dbf02bb3d1af");
      return this.mock.TWARE_StartTransaction();
    }
    return response;
  }

  @APICallLogger
  public TWARE_endTransaction() {
    //token > tware
    methodCalls("call TWARE_endTransaction");

    if (WebResponseService.settings.production_TWARE == true) {
      //  this.postEJMessage("Closing TWare Transaction File").subscribe(res => {});

      return this.http.put(
        WebServices.endTransaction,
        {},
        this.setTWARE_Header(),
      );
    } else {
      methodCalls("Mocking TWARE_endTransaction");
      return this.mock.EndTWareTransaction();
    }
  }

  @APICallLogger
  public getTWARE_NETWORK_STATUS() {
    // methodCalls("call getTWARE_NETWORK_STATUS");
    console.log("call getTWARE_NETWORK_STATUS");
    if (
      WebResponseService.settings &&
      WebResponseService.settings.production_TWARE == true
    ) {
      return this.http.get(WebServices.networkStatusTWARE);
    } else {
      //  methodCalls("Mocking getTWARE_NETWORK_STATUS");
      // return this.http.get("https://mocki.io/v1/086a24da-1e18-46ec-baa1-c930a3a0bd3e");
      return this.mock.NetworkStatus();
    }
  }

  @APICallLogger
  public initTransaction() {
    methodCalls("call initTransaction");
    if (WebResponseService.settings.production_QServices == true) {
      let isSubIdentifier: boolean = false;
      if (ApplicationData.customer.collectedAmount > 0) {
        isSubIdentifier = true;
      }
      let body = {
        TransactionCategoryId: getTransactionType(),
        IsSubTransaction: isSubIdentifier,
      };
      methodCalls(body);
      console.log("Request Body InitTransaction:", body); // Log the request body
      return this.http.post(WebServices.initTransaction, body);
    } else {
      //  methodCalls("Mocking getTWARE_NETWORK_STATUS");
      // return this.http.get("https://mocki.io/v1/086a24da-1e18-46ec-baa1-c930a3a0bd3e");
      return this.mock.InitTransaction();
    }
  }

  @APICallLogger
  public getTWARE_DEVICE_AUTH() {
    methodCalls("call getTWARE_DEVICE_AUTH");
    if (WebResponseService.settings.production_TWARE == true) {
      let body = {
        appVersion: WebResponseService.settings.app_version,
      };
      return this.http.get(WebServices.deviceAuthTWARE);
    } else {
      // methodCalls("Mocking getTWARE_DEVICE_AUTH");
      //  return this.http.get("https://mocki.io/v1/c81d20f8-d88f-4a9b-9894-db67f7cc658d");
      return this.mock.DeviceAuth();
    }
  }

  @APICallLogger
  public TWARE_resetServices() {
    methodCalls("call TWARE_resetServices");
    if (WebResponseService.settings.production_TWARE == true) {
      let body = {
        appVersion: WebResponseService.settings.app_version,
      };
      return this.http.put(
        WebServices.resetServices,
        body,
        this.setTWARE_Header(),
      );
    } else {
      methodCalls("Mocking TWARE_resetServices");
      return this.http.get(
        "https://mocki.io/v1/385acf2c-416e-4787-b390-96d1eec5e796",
      );
    }
  }

  @APICallLogger
  public checkTWARE_terminalHealth() {
    methodCalls("call checkTWARE_deviceHealth");
    if (
      WebResponseService.settings &&
      WebResponseService.settings.production_TWARE == true
    ) {
      // let body = {
      //   "appVersion": WebResponseService.settings.app_version
      // }

      return this.http.get(WebServices.checkHealth);
    } else {
      //   methodCalls("Mocking checkTWARE_deviceHealth");
      //   return this.http.get("https://mocki.io/v1/df2c16a8-977f-42c3-8def-fe7c13429f15");
      return this.mock.DeviceHealth();
    }
  }

  @APICallLogger
  public postTerminalHealth(health: any, terminalStatus: any) {
    methodCalls("call postTerminalHealth");
    if (WebResponseService.settings.production_QServices == true) {
      let body = {
        Terminal: {
          Health: "OK",
          Info: terminalStatus,
        },
        DeviceList: health,

        Sender: {
          SenderId: ApplicationData.perefernces.superUserId,
          ...this.setQServices_sender(),
        },
      };
      return this.http.post(
        WebServices.updateTerminalHealth,
        body,
        this.setQServices_Header(),
      );
    } else {
      methodCalls("Mocking postTerminalHealth");
      return this.http.get(
        "https://mocki.io/v1/d33530bf-c015-40bf-8df5-a05803fafbe2",
      );
    }
  }

  @APICallLogger
  public updateCashAcceptorHealth(errorCode: any, errorMessage: any) {
    methodCalls("call postTerminalHealth");
    if (WebResponseService.settings.production_QServices == true) {
      let body = {
        ErrorCode: errorCode,
        ErrorDescription: errorMessage,
        Sender: {
          SenderId: ApplicationData.perefernces.superUserId,
          ...this.setQServices_sender(),
        },
      };

      return this.http.post(
        WebServices.updateCashAcceptorHealth,
        body,
        this.setQServices_Header(),
      );
    } else {
      methodCalls("Mocking postTerminalHealth");
      return this.http.get(
        "https://mocki.io/v1/d33530bf-c015-40bf-8df5-a05803fafbe2",
      );
    }
  }

  @APICallLogger
  public performCashTransaction() {
    console.log("call performCashTransaction");
    let denom: any;
    if (sessionStorage.getItem("currentDenom")) {
      denom = JSON.parse(String(sessionStorage.getItem("currentDenom")));
    } else {
      denom = [];
    }

    let body = {
      CitizenNumber: ApplicationData.customer.CNIC,
      MobileNumber: getMobileNumber(),
      AccountTitle: getAccountTitle(),
      CapturedImage: [],
      CassetteCounters: [],
      ToAccountNumber: getAccountNumber(),
      TransactionCategoryId: getTransactionType(),
      SystemReferenceNumber:
        ApplicationData.sessionTransaction.systemreferencenumber,
      DepositAmount: getEnteredAmount(),
      AcceptedAmount: sessionStorage.getItem("currentAmount"),
      TransactionPurposeId: getTransactionPurposeId(),
      Denominations: denom,
      DispenseDetail: {
        totalRetractCount: 0,
        totalSuspiciousCount: 0,
        totalDispenseCount: 0,
        totalDispenseAmount: 0,
        DispenseDenominations: [],
        RetractDenominations: [],
        SuspiciousDenominations: [],
      },
      DispenseDenominations: [],
      Sender: {
        ...this.setQServices_sender(),
      },
    };

    methodCalls("Transaction body:");
    methodCalls(body);
    console.log("Ft Body", body);
    if (WebResponseService.settings.production_QServices == true) {
      return this.http.post(
        WebServices.performCashTransaction,
        body,
        this.setQServices_Header(),
      );
    } else {
      methodCalls("Mocking performCashTransaction");
      return this.mock.PerformCashTransaction();
    }
  }

  @APICallLogger
  public GetNetworkProvidersList() {
    methodCalls("call GetNetworkProvidersList");
    let body = {
      Sender: {
        ...this.setQServices_sender(),
      },
    };
    methodCalls("Transaction body:");

    if (WebResponseService.settings.production_QServices == true) {
      return this.http.post(
        WebServices.GetNetworkProvidersList,
        body,
        this.setQServices_Header(),
      );
    } else {
      methodCalls("Mocking GetNetworkProvidersList");
      return this.http.get(
        "https://mocki.io/v1/f28ed118-bbc3-4119-8a2a-46190c40a991",
      );
    }
  }

  @APICallLogger
  public MobileTopupSubTransaction() {
    methodCalls("call MobileTopupSubTransaction");

    let isSubIdentifier: boolean = false;
    if (ApplicationData.customer.collectedAmount > 0) {
      isSubIdentifier = true;
    }

    let body = {
      CitizenNumber: ApplicationData.customer.CNIC,
      isSubTransaction: isSubIdentifier,
      DepositAmount: sessionStorage.getItem("currentAmount"),
      TopupAmount: getEnteredAmount(),
      MobileNumber: getMobileNumber(),
      CapturedImage: [],
      SystemReferenceNumber:
        ApplicationData.sessionTransaction.systemreferencenumber,
      CompanyCode: ApplicationData.sessionTransaction.company.code,
      CompanyId: ApplicationData.sessionTransaction.company.id,
      TransactionCategoryId: getTransactionType(),
      Denominations: JSON.parse(String(sessionStorage.getItem("currentDenom"))),
    };

    console.log("TopUp Api Body", body);
    methodCalls("Transaction body:");
    if (WebResponseService.settings.production_QServices == true) {
      return this.http.post(
        WebServices.MobileTopupTransaction,
        body,
        this.setQServices_Header(),
      );
    } else {
      methodCalls("Mocking MobileTopupSubTransaction");

      return this.mock.PerformTopup();
    }
  }

  @APICallLogger
  public performChequeTransaction(chequeDetails) {
    methodCalls("call performChequeTransaction");
    let body = {
      CitizenNumber: ApplicationData.customer.CNIC,
      MobileNumber: getMobileNumber(),
      AccountTitle: getAccountTitle(),
      CapturedImage: [],
      ToAccountNumber: getAccountNumber(),
      TransactionCategoryId: getTransactionType(),
      SystemReferenceNumber:
        ApplicationData.sessionTransaction.systemreferencenumber,
      DepositAmount: getEnteredAmount(),
      TransactionPurposeId: getTransactionPurposeId(),
      FromAccountNumber: chequeDetails.accountNo,
      ChequeNumber: chequeDetails.chequeNo,
      BankCode: chequeDetails.bankCode,
      MICR: chequeDetails.micr,
      BranchCode: chequeDetails.branchCode,
      CurrencyCode: chequeDetails.currencyCode,
      FrontImage: chequeDetails.frontImage,
      BackImage: chequeDetails.rearImage,
      FrontUVImage: chequeDetails.frontUV,
      BackUVImage: chequeDetails.rearUV,
      Sender: {
        ...this.setQServices_sender(),
      },
    };

    console.log("Cheque Transaction", body);

    if (WebResponseService.settings.production_QServices == true) {
      return this.http.post(
        WebServices.performChequeTransaction,
        body,
        this.setQServices_Header(),
      );
    } else {
      methodCalls("Mocking performChequeTransaction");
      return this.mock.PerformChequeTransaction();
    }
  }

  @APICallLogger
  public VerifyChequeTransaction(chequeDetails) {
    methodCalls("call performChequeTransaction");
    let body = {
      CitizenNumber: ApplicationData.customer.CNIC,
      MobileNumber: getMobileNumber(),
      AccountTitle: getAccountTitle(),
      CapturedImage: [],
      ToAccountNumber: getAccountNumber(),
      TransactionCategoryId: getTransactionType(),
      SystemReferenceNumber:
        ApplicationData.sessionTransaction.systemreferencenumber,
      DepositAmount: getEnteredAmount(),
      TransactionPurposeId: getTransactionPurposeId(),
      FromAccountNumber: chequeDetails.accountNo,
      ChequeNumber: chequeDetails.chequeNo,
      BankCode: chequeDetails.bankCode,
      MICR: chequeDetails.micr,
      BranchCode: chequeDetails.branchCode,
      CurrencyCode: chequeDetails.currencyCode,
      FrontImage: chequeDetails.frontImage,
      BackImage: chequeDetails.rearImage,
      FrontUVImage: chequeDetails.frontUV,
      BackUVImage: chequeDetails.rearUV,
      Sender: {
        ...this.setQServices_sender(),
      },
    };

    console.log("Cheque Transaction", body);

    if (WebResponseService.settings.production_QServices == true) {
      return this.http.post(
        WebServices.VerifyChequeTransaction,
        body,
        this.setQServices_Header(),
      );
    } else {
      methodCalls("Mocking performChequeTransaction");
      return this.mock.PerformChequeTransaction();
    }
  }

  @APICallLogger
  public updateTransactionStatus(status: String, stackDetail: any) {
    methodCalls("call updateTransactionStatus");
    let denom: any;
    if (sessionStorage.getItem("currentDenom")) {
      denom = JSON.parse(String(sessionStorage.getItem("currentDenom")));
    } else {
      denom = [];
    }

    let stackStatus = status;
    if (
      String(status).toLowerCase() === "abandoned" ||
      String(status).toLowerCase() === "cancelled"
    ) {
      setTransactionStatus(status);
      stackStatus = "";
    } else if (String(status).toLowerCase() === "suspect") {
      setTransactionStatus(status);
      stackStatus = "Failed";
    } else if (String(status).toLowerCase() === "customer") {
      setTransactionStatus("Cancelled");
      stackStatus = "";
    }

    var body = {};

    body = {
      CitizenNumber: ApplicationData.customer.CNIC,
      SystemReferenceNumber:
        ApplicationData.sessionTransaction.systemreferencenumber,
      Sender: {
        ...this.setQServices_sender(),
      },
      StackStatus: stackStatus,
      MobileNumber: getMobileNumber(),
      TransactionStatus: getTransactionStatus(),
      Denominations: denom,
      DispenseDetail: {
        totalRetractCount: 0,
        totalSuspiciousCount: 0,
        totalDispenseCount: 0,
        totalDispenseAmount: 0,
        DispenseDenominations: [],
        RetractDenominations: [],
        SuspiciousDenominations: [],
      },
      DispenseDenominations: [],
      WithdrawalAmount: sessionStorage.getItem("convertedAmount"),
      DepositAmount: getEnteredAmount(),
      AcceptedAmount: sessionStorage.getItem("currentAmount"),
      DispenseAmount: sessionStorage.getItem("convertedAmount"),
      TransactionPurposeId: getTransactionPurposeId(),
    };

    if (String(status).toLowerCase() == "success") {
      body = {
        ...body,
        StackDetail: stackDetail,
      };
    } else {
      body = {
        ...body,
        StackDetail: [],
      };
    }
    console.log("TransactionStatus Body", body);
    methodCalls("Transaction body:");
    methodCalls(body);
    if (WebResponseService.settings.production_QServices == true) {
      return this.http.post(
        WebServices.updateTransactionStatus,
        body,
        this.setQServices_Header(),
      );
    } else {
      methodCalls("Mocking updateTransactionStatus");
      return this.mock.UpdateTransactionStatus();
    }
  }

  @APICallLogger
  public updateTransactionStatusTeller(status: String, stackDetail: any) {
    methodCalls("call updateTransactionStatus");
    let denom: any;
    if (sessionStorage.getItem("currentDenom")) {
      denom = JSON.parse(String(sessionStorage.getItem("currentDenom")));
    } else {
      denom = [];
    }

    let stackStatus = status;
    // if (
    //   String(status).toLowerCase() === "abandoned" ||
    //   String(status).toLowerCase() === "cancelled"
    // ) {
    //   setTransactionStatus(status);
    //   stackStatus = "";
    // } else if (String(status).toLowerCase() === "suspect") {
    //   setTransactionStatus(status);
    //   stackStatus = "Failed";
    // } else if (String(status).toLowerCase() === "customer") {
    //   setTransactionStatus("Cancelled");
    //   stackStatus = "";
    // }

    var body = {};

    body = {
      CitizenNumber: ApplicationData.customer.CNIC,
      SystemReferenceNumber:
        ApplicationData.sessionTransaction.systemreferencenumber,
      Sender: {
        ...this.setQServices_sender(),
      },
      StackStatus: stackStatus,
      TransactionStatus: getTransactionStatus(),
      Denominations: denom,
      MobileNumber: getMobileNumber(),
      DepositAmount: getEnteredAmount(),
      AcceptedAmount: sessionStorage.getItem("currentAmount"),
      TransactionPurposeId: getTransactionPurposeId(),
      DispenseDetail: {
        totalRetractCount: 0,
        totalSuspiciousCount: 0,
        totalDispenseCount: 0,
        totalDispenseAmount: 0,
        DispenseDenominations: [],
        RetractDenominations: [],
        SuspiciousDenominations: [],
      },
      DispenseDenominations: [],
      WithdrawalAmount: sessionStorage.getItem("convertedAmount"),
      DispenseAmount: sessionStorage.getItem("convertedAmount"),
    };

    if (String(status).toLowerCase() == "success") {
      body = {
        ...body,
        StackDetail: stackDetail,
      };
    } else {
      body = {
        ...body,
        StackDetail: [],
      };
    }
    console.log("TransactionStatus Body", body);
    methodCalls("Transaction body:");
    methodCalls(body);
    if (WebResponseService.settings.production_QServices == true) {
      return this.http.post(
        WebServices.updateTransactionStatus,
        body,
        this.setQServices_Header(),
      );
    } else {
      methodCalls("Mocking updateTransactionStatus");
      return this.mock.UpdateTransactionStatus();
    }
  }

  @APICallLogger
  public performCashTransactionInquiry() {
    methodCalls("call performCashTransactionInquiry");
    let body = {
      CitizenNumber: ApplicationData.customer.CNIC,
      MobileNumber: getMobileNumber(),
      AccountTitle: getAccountTitle(),
      SystemReferenceNumber:
        ApplicationData.sessionTransaction.systemreferencenumber,
      Sender: {
        ...this.setQServices_sender(),
      },
    };
    if (WebResponseService.settings.production_QServices == true) {
      return this.http.post(
        WebServices.inquiryCashTransaction,
        body,
        this.setQServices_Header(),
      );
    } else {
      methodCalls("Mocking performCashTransactionInquiry");
      return this.http.get(
        "https://mocki.io/v1/f28ed118-bbc3-4119-8a2a-46190c40a991",
      );
    }
  }

  @APICallLogger
  public getLanguages() {
    methodCalls("call getLanguages");

    if (WebResponseService.settings.production_QServices == true) {
      return this.http.get(WebServices.getLanguages);
    } else {
      methodCalls("Mocking getLanguages");
      //  return this.http.get("https://mocki.io/v1/ef4cf693-311c-48f3-a0a1-a4de06d478b7");
      return this.mock.GetSupportedLanguages();
    }
  }

  @APICallLogger
  public postEJMessage(commentMessage) {
    let body = {
      message: commentMessage.toUpperCase(),
    };

    if (
      WebResponseService.settings &&
      WebResponseService.settings.log_EJ == true
    ) {
      console.info(
        "EJ=> " +
          new Date().toLocaleString() +
          " => " +
          body.message.toUpperCase(),
      );
    }

    if (
      WebResponseService.settings &&
      WebResponseService.settings.production_TWARE == true
    ) {
      return this.http.post(WebServices.PostEJMessage, body);
    }
  }

  @APICallLogger
  public checkServiceStatus(route: any) {
    let body = {
      message: route,
    };
    if (
      WebResponseService.settings &&
      WebResponseService.settings.production_TWARE == true
    ) {
      return this.http.post(WebServices.terminalStatus, body);
    } else {
      return this.mock.CheckTerminalStatus();
    }
  }

  @APICallLogger
  public customerScreening() {
    methodCalls("call customerValidation");

    let body = {
      CitizenNumber: ApplicationData.customer.CNIC,
      SystemReferenceNumber:
        ApplicationData.sessionTransaction.systemreferencenumber,
    };
    console.log("The Request Body Which goes to Api:", body);

    if (WebResponseService.settings.production_QServices == true) {
      return this.http.post(
        WebServices.CustomerScreening,
        body,
        this.setQServices_Header(),
      );
    } else {
      methodCalls("Customer Screening Mock");
      return this.mock.customerScreening();
    }
  }

  @APICallLogger
  public getDenominationAuthorization() {
    methodCalls("call getDenominationAuthorization");

    let body = {
      ...this.setQServices_sender(),
    };

    if (WebResponseService.settings.production_QServices == true) {
      return this.http.get(WebServices.GetAuthorizedDenominations);
      //return this.http.get("https://mocki.io/v1/ee0fd355-31ae-452e-a9ac-53e748b202e8");
    } else {
      // methodCalls("Mocking getDenominationAuthorization");
      // return this.http.get("https://mocki.io/v1/ee0fd355-31ae-452e-a9ac-53e748b202e8");
      return this.mock.AuthorizeDenominations();
    }
  }

  @APICallLogger
  public getTransactionFLow() {
    methodCalls("call getTransactionFLow");

    let body = {
      CashTransactionId: "2",
      Sender: {
        ...this.setQServices_sender(),
      },
    };
    console.log("Transaction Flow Body", body);

    if (WebResponseService.settings.production_QServices == true) {
      return this.http.post(
        WebServices.GetTransactionFow,
        body,
        this.setQServices_Header(),
      );
      //return this.http.get("https://mocki.io/v1/ee0fd355-31ae-452e-a9ac-53e748b202e8");
    } else {
      methodCalls("Mocking getTransactionFLow");
      return this.http.get(
        "https://mocki.io/v1/ee0fd355-31ae-452e-a9ac-53e748b202e8",
      );
    }
  }

  // @APICallLogger
  // public getBanksList() {
  //   methodCalls("call getBanksList");

  //   let body = {

  //     "Sender": {
  //       ... this.setQServices_sender()
  //     }
  //   }

  //   if (WebResponseService.settings.production_QServices == true) {

  //     //   return this.http.post(WebServices.paymentPurposes, body, this.setQServices_Header());
  //     return this.http.get("https://mocki.io/v1/43b65fae-5fc6-4bba-bc05-f956612233ad");
  //   }
  //   else {
  //     methodCalls("Mocking getBanksList");
  //     return this.http.get("https://mocki.io/v1/43b65fae-5fc6-4bba-bc05-f956612233ad");
  //   }

  // };

  @APICallLogger
  public getBeneficiaryList() {
    methodCalls("call getBeneficiaryList");

    let body = {
      RequestString: ApplicationData.customer.CNIC,
      Sender: {
        ...this.setQServices_sender(),
      },
    };

    if (WebResponseService.settings.production_QServices == true) {
      return this.http.post(
        WebServices.getBeneficiaries,
        body,
        this.setQServices_Header(),
      );
      //return this.http.get("https://mocki.io/v1/92e0d981-f402-4bbf-9e39-dc6590304276"); //1 record
      //return this.http.get("https://mocki.io/v1/0be96330-7d45-42f4-8801-6ae92371fbe3");
    } else {
      methodCalls("Mocking getBanksList");
      return this.mock.GetBenefciaries();
      //  return this.http.get("https://mocki.io/v1/43b65fae-5fc6-4bba-bc05-f956612233ad");
    }
  }

  @APICallLogger
  public updateMachineCounter(denominations: any) {
    methodCalls("call updateMachineCounter");

    if (WebResponseService.settings.production_QServices == true) {
      return this.http.post(WebServices.updateCounters, denominations);
    } else {
      methodCalls("Mocking updateMachineCounter");
      //   return this.http.get("https://mocki.io/v1/6fb3585d-7bfd-4cbb-8a04-1939d794f8a9");
    }
  }

  public callVideoAgent() {
    methodCalls("call callVideAgent");

    if (WebResponseService.settings.production_QServices == true) {
      return this.http.get(WebServices.CallAgentVideo);
    } else {
      methodCalls("Mocking callVideAgent");
      return this.mock.CallAgent();
    }
  }

  @APICallLogger
  getConfigurationJSON() {
    return this.http.get("assets/app_constants.json");
  }

  @APICallLogger
  public getLangLabels(languageCode) {
    return this.http.get("assets/app-labels-" + languageCode + ".json");
  }

  @APICallLogger
  public getLangMessages(languageCode) {
    return this.http.get("assets/app-messages-" + languageCode + ".json");
  }

  @APICallLogger
  public ledToggle(ledCode, triggerOption) {
    return this.mock.LEDToggle();
    // PLaced The Mock On the Root so that it returns just after called
    methodCalls("call ledToggle");
    if (WebResponseService.settings.production_TWARE == true) {
      let body = {
        led: ledCode,
        switch: triggerOption,
      };

      return this.http.post(
        WebServices.ledService,
        body,
        this.setTWARE_Header(),
      );
    } else {
      methodCalls("Mocking ledToggle");
      return this.mock.LEDToggle();
    }
  }

  @APICallLogger
  public doorSensor() {
    methodCalls("call doorSensor");
    if (
      WebResponseService.settings != undefined &&
      WebResponseService.settings.production_TWARE == true
    ) {
      return this.http.post(
        WebServices.doorsService,
        {},
        this.setTWARE_Header(),
      );
    } else {
      methodCalls("Mocking doorSensor");
      return this.http.get("assets/mock/api/doorSensors.json");
    }
  }

  setTWARE_Header(): any {
    this.TWARE_http = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        jwt: "jwt " + ApplicationData.config.jwtToken,
      }),
    };
    return this.TWARE_http;
  }

  setQServices_Header(): any {
    this.QServices_http = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + ApplicationData.config.QToken,
      }),
    };
    return this.QServices_http;
  }

  setQServices_sender(): any {
    let body = {
      SenderName: ApplicationData.config.deviceCode,
      SenderType: "Terminal",
      IPAddress: ApplicationData.config.ipAddress,
      Location: ApplicationData.config.officeName,
    };
    return body;
  }

  //For Utility Bill Tranasaction

  @APICallLogger
  public getBillingCompanies() {
    methodCalls("call getBillingCompanies");

    let body = {
      RequestId: getTransactionType(),
      Sender: {
        ...this.setQServices_sender(),
      },
    };

    // Log the body before sending the request
    console.log("Request Body:", body);

    if (WebResponseService.settings.production_QServices) {
      return this.http.post(
        WebServices.getBillingCompanies,
        body,
        this.setQServices_Header(),
      );
    } else {
      methodCalls("Mocking getBillingCompanies");
      return this.mock.getBillingCompanies();
    }
  }

  @APICallLogger
  public getBanksList() {
    methodCalls("call getBankList");

    let body = {
      // "RequestId": getTransactionType(),
      // "Sender": {
      //   ...this.setQServices_sender()
      // }
    };

    // Log the body before sending the request
    console.log("Request Body:", body);

    if (WebResponseService.settings.production_QServices) {
      return this.http.get(WebServices.getBankList);
    } else {
      methodCalls("Mocking getBankList");
      return this.mock.bankList();
    }
  }

  @APICallLogger
  public getBillDetail(company: any) {
    methodCalls("call FetchBillDetails");

    let body = {
      RequestId: getTransactionType(),
      ConsumerNumber: getAccountNumber(),
      CompanyId: getbillingCompanyId(),
      CompanyCode: getbillingCompanyCode(),
      SystemReferenceNumber:
        ApplicationData.sessionTransaction.systemreferencenumber,
      Sender: {
        ...this.setQServices_sender(),
      },
    };

    // Log the body before making the API call
    console.log("The Request Body Which goes to Api:", body);

    if (WebResponseService.settings.production_QServices == true) {
      return this.http.post(
        WebServices.FetchBillDetails,
        body,
        this.setQServices_Header(),
      );
    } else {
      methodCalls("Mocking FetchBillDetails");
      return this.mock.FetchBillDetail();
    }
  }

  @APICallLogger
  public performBillTransaction() {
    methodCalls("call performBillTransaction");
    let denom;

    if (sessionStorage.getItem("currentDenom")) {
      denom = JSON.parse(String(sessionStorage.getItem("currentDenom")));
    } else {
      denom = [];
    }

    let body = {
      MobileNumber: getMobileNumber(),
      CitizenNumber: ApplicationData.customer.CNIC,
      TransactionCategoryId: getTransactionType(),
      CapturedImage: [],
      DepositAmount: sessionStorage.getItem("currentAmount"),
      SystemReferenceNumber:
        ApplicationData.sessionTransaction.systemreferencenumber,
      BillDetails: getTransactionData(),
      Denominations: denom,
      Sender: {
        ...this.setQServices_sender(),
      },
    };
    methodCalls("Transaction body:");
    methodCalls(body);
    console.log("The Request Body Which goes to Api:", body);
    if (WebResponseService.settings.production_QServices == true) {
      return this.http.post(
        WebServices.performBillTransaction,
        body,
        this.setQServices_Header(),
      );
    } else {
      methodCalls("Mocking performBillTransaction");
      return this.mock.FinalBillingResult();
    }
  }

  @APICallLogger
  public performBillInquiry() {
    methodCalls("call performBillInquiry");
    let body = {
      MobileNumber: getMobileNumber(),
      TransactionCategoryId: getTransactionType(),
      DepositAmount: sessionStorage.getItem("currentAmount"),
      SystemReferenceNumber:
        ApplicationData.sessionTransaction.systemreferencenumber,
      BillDetails: getTransactionData(),
      Denominations: JSON.parse(String(sessionStorage.getItem("currentDenom"))),
      Sender: {
        ...this.setQServices_sender(),
      },
    };
    methodCalls("Transaction body:");
    methodCalls(body);
    if (WebResponseService.settings.production_QServices == true) {
      return this.http.post(
        WebServices.performBillInquiry,
        body,
        this.setQServices_Header(),
      );
    } else {
      methodCalls("Mocking performBillInquiry");
      return this.mock.FinalBillingResult();
    }
  }

  @APICallLogger
  public chequeEndorse() {
    methodCalls("call chequeEndorse");
    let body = {
      textToPrint: getAccountNumber() + " - " + getAccountTitle(),
    };
    console.log(body);
    if (WebResponseService.settings.production_TWARE == true) {
      return this.mock.EndorseCheque();

      return this.http.post(
        WebServices.chequeEndorse,
        body,
        this.setTWARE_Header(),
      );
    } else {
      methodCalls("Mocking chequeEndorse");
      return this.mock.EndorseCheque();
    }
  }

  @APICallLogger
  public parseCheque(imageBase64: string) {
    methodCalls("call parseCheque");

    let body = {
      image_base64: imageBase64,
      content_type: "image/jpeg",
      filename: "cheque.jpg",
    };

    consoleLog("web-response.service.ts", "Request parseCheque", body);

    if (
      WebResponseService.settings &&
      WebResponseService.settings.production_QServices == true
    ) {
      return this.http.post(WebServices.parseCheque, body);
    } else {
      methodCalls("Mocking parseCheque");
      return this.mock.ParseCheque();
    }
  }

  @APICallLogger
  public startAiAgent(
    accountNumber: string,
    accountTitle: string,
    depositAmount: any,
  ) {
    methodCalls("call startAiAgent");
    if (
      WebResponseService.settings &&
      WebResponseService.settings.production_AIAgent === true
    ) {
      const url = `http://127.0.0.1:8080/call/start?AccountNumber=${encodeURIComponent(
        accountNumber,
      )}&AccountTitle=${encodeURIComponent(
        accountTitle,
      )}&DepositAmount=${encodeURIComponent(depositAmount.toString())}`;
      return this.http.get(url);
    } else {
      methodCalls("Mocking startAiAgent");
      return this.mock.StartAiAgent();
    }
  }

  @APICallLogger
  public checkAiAgentHealth() {
    methodCalls("call checkAiAgentHealth");
    if (
      WebResponseService.settings &&
      WebResponseService.settings.production_AIAgent === true
    ) {
      return this.http.get("http://127.0.0.1:8080/health");
    } else {
      methodCalls("Mocking checkAiAgentHealth");
      return this.mock.CheckAiAgentHealth();
    }
  }

  @APICallLogger
  public getAiAgentTransaction(sessionId: string = "atm-1") {
    methodCalls("call getAiAgentTransaction");
    if (
      WebResponseService.settings &&
      WebResponseService.settings.production_AIAgent === true
    ) {
      return this.http.get(
        `http://127.0.0.1:8080/transaction?session_id=${encodeURIComponent(sessionId)}`,
      );
    } else {
      methodCalls("Mocking getAiAgentTransaction");
      return this.mock.GetAiAgentTransaction(sessionId);
    }
  }
}
