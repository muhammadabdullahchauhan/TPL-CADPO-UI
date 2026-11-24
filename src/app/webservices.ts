import { ApplicationData } from "./classes/application";
export class WebServices {
  static AGENT_HARDWARE = "http://localhost:3641/Tware/";
  static AGENT_QSERVICE = "http://localhost:3641/api/";

  static bioMetricService: string = this.AGENT_HARDWARE + "hardware/fingerprint-scanner/scan";
  static intializeAcceptor:string = this.AGENT_HARDWARE + "hardware/cash-acceptor/snbc/init";
  // static acceptorAcceptCash: string = this.AGENT_HARDWARE + "hardware/cash-acceptor/bulk/accept?maxAmount=500";
  static acceptorStack: string = this.AGENT_HARDWARE + "hardware/cash-acceptor/bulk/stack";
  static acceptorRejectCash: string = this.AGENT_HARDWARE + "hardware/cash-acceptor/bulk/reject";
  static acceptorOpenCloseShutter: string = this.AGENT_HARDWARE + "hardware/cash-acceptor/snbc/opencloseshutter";
  static acceptorOpenCloseDropDoor: string = this.AGENT_HARDWARE + "hardware/cash-acceptor/snbc/openclosedropdoor";
  static acceptorScanCheque: string = this.AGENT_HARDWARE + "hardware/cheque-acceptor/scan";
  static acceptorCheckCheque: string = this.AGENT_HARDWARE + "hardware/cheque-acceptor/checkentry";
  static acceptorDepositCheque: string = this.AGENT_HARDWARE + "hardware/cheque-acceptor/deposit";
  static acceptorCancelCheque: string = this.AGENT_HARDWARE + "hardware/cheque-acceptor/canceldeposit";
  static receiptPrinter: string = this.AGENT_HARDWARE + "hardware/printer/receipt";
  static networkStatusTWARE: string = this.AGENT_HARDWARE + "device/status";

  static deviceAuthTWARE: string = this.AGENT_HARDWARE + "device/auth";
  static startCashTransaction: string = this.AGENT_HARDWARE + "transaction/start";
  static startChequeTransaction: string = this.AGENT_HARDWARE + "transaction/start-cheque";
  static endTransaction: string = this.AGENT_HARDWARE + "transaction/end";
  static checkHealth: string = this.AGENT_HARDWARE + "heartbeat/devicehealth";
  static resetServices: string = this.AGENT_HARDWARE + "device/reset";
  static updateCounters: string = this.AGENT_HARDWARE + "transaction/update-counters";
  static getCounters: string = this.AGENT_HARDWARE + "transaction/get-counters";

  static initTransaction: string = this.AGENT_QSERVICE + "InitiateTransaction";
  static CustomerScreening: string = this.AGENT_QSERVICE + "CustomerScreening";
  static terminalAuth: string = this.AGENT_QSERVICE + "terminal-auth";
  static verifyBiometric: string = this.AGENT_QSERVICE + "VerifyBiometric";
  static imageEventList: string = this.AGENT_QSERVICE + "GetTransactionImageEventList";
  static paymentPurposes: string = this.AGENT_QSERVICE + "GetTransactionPurposeList";
  static fetchAccountTitle: string = this.AGENT_QSERVICE + "FetchTitle";
  static getAccountsList: string = this.AGENT_QSERVICE + "GetTaggedAccounts";
  static VerifyChequeTransaction: string = this.AGENT_QSERVICE + "VerifyChequeTransaction";
  static performCashTransaction: string = this.AGENT_QSERVICE + "PerformCashTransaction";
  static performChequeTransaction: string = this.AGENT_QSERVICE + "PerformChequeTransaction";
  static inquiryCashTransaction: string = this.AGENT_QSERVICE + "PerformCashTransactionInquiry";
  static updateTerminalHealth: string = this.AGENT_QSERVICE + "UpdateDeviceHealth";
  static postTransactionImage: string = this.AGENT_QSERVICE + "TransactionImage";
  static getTransactionSections: string = this.AGENT_QSERVICE + "GetTransactionCategoryMapping";
  static updateTransactionStatus: string = this.AGENT_QSERVICE + "UpdateTransactionStatus";
  static getLanguages: string = this.AGENT_QSERVICE + "GetSupportedLanguages";
  static GetAuthorizedDenominations: string = this.AGENT_QSERVICE + "GetAuthorizedDenominations";
  static GetTransactionFow: string = this.AGENT_QSERVICE + "GetTransactionFlow";
  static updateCashAcceptorHealth: string = this.AGENT_QSERVICE + "UpdateCashAcceptorHealth";
  static getBeneficiaries: string = this.AGENT_QSERVICE + "GetBeneficiariesByCitizenNumber";
  static GetNetworkProvidersList: string = this.AGENT_QSERVICE + "GetNetworkProvidersList";
  static MobileTopupTransaction: string = this.AGENT_QSERVICE + "MobileTopupTransaction";
  static CallAgentVideo: string = this.AGENT_QSERVICE + "OpenQConnectApplication";
  static PostEJMessage: string = this.AGENT_HARDWARE + "ej";
  static terminalStatus: string = this.AGENT_HARDWARE + "terminalStatus";

  //SUPERVISORY SERVICES
  static ledService: string = this.AGENT_HARDWARE + "hardware/LED/switch";
  static doorsService: string = this.AGENT_HARDWARE + "hardware/door-sensor/status";
  static versionInfo: string = this.AGENT_HARDWARE + "hardware/cash-acceptor/snbc/versioninfo";

  static loginUser: string = this.AGENT_QSERVICE + "auth";
  static getCurrentBatchDetail: string = this.AGENT_QSERVICE + "GetBatchDetailsByCode";
  static getLastTransaction: string = this.AGENT_QSERVICE + "GetLastTransaction";
  static getLastClosedBatch: string = this.AGENT_QSERVICE + "GetLastClosedBatch";
  static closeCurrentBatch: string = this.AGENT_QSERVICE + "CITBatchCreate";

  // For Utility Bill Transaction
  static getBillingCompanies: string = this.AGENT_QSERVICE + "GetBillingCompanies";
  static FetchBillDetails: string = this.AGENT_QSERVICE + "FetchBillDetails";
  static performBillTransaction: string = this.AGENT_QSERVICE + "BillPayment";
  static performBillInquiry: string = this.AGENT_QSERVICE + "BillPaymentInquiry";
  static getBankList: string = this.AGENT_QSERVICE + "getbanks";
  static chequeEndorse: string = this.AGENT_HARDWARE + "hardware/cheque-acceptor/endorse";
  static parseCheque: string = this.AGENT_QSERVICE + "parsecheque";

  static get acceptorAcceptCash(): string {
    console.log("AcceptCash: ********************/accept?limitMode=2&limitValue=" + ApplicationData.sessionTransaction.valueLimit);
    return this.AGENT_HARDWARE + "hardware/cash-acceptor/bulk/accept?limitMode=0&limitValue=" + 0;
  }


}
