import { WebcamImage } from "ngx-webcam";

export class ApplicationData {
    static config = {
        jwtToken: "",
        deviceCode: "",
        ipAddress: "",
        branchCode: "",
        officeName: "",
        QToken: "",
        heartbeatInterval: 3000,
        currentInterval: 60000,
        sessionInterval: 60000,
        cashTimeout: 60,
        chequeTimeout: 60,
        apiReference: Object

    };

    static log = {
        message: true,
        response: true,
        subsribed: true
    };

    static perefernces = {
        superUser: false,
        sensorWarning: false,
        superUserId: 0,
        batchCapacity: "Remaining",
        healthCall: false,
        apiCall: false,
        printerHealth: "OK",
        pendingResponse: false,
        bioHealthCheck: false,
        languages: Object,
        notificationText: "",
        inservice: false,
        criticallyOutService: false,
        terminalHealth: Object,
        terminalAuthorized: false,
        healthyTerminal: false,
        lastServiceStatus: "OUT OF SERVICE",
        pendingCancellation: false,
        transactionPerformed: false,
        oncesChequeResponse: false
    };

    static customer = {
        CNIC: "",
        collectedAmount: 0,
        authorized: false
    }


    static sessionTransaction = {
        // For Cheque No
        chequeNo:"",
        transactionType: 0,
        outerSteps: 0,
        transactionTitle: "",
        billingCompaniesData: Object,
        transactionData: Object,
        chequeData: Object,
        parsedChequeData: null as any,
        isChequeParsed: false,
        cdmReferenceNumber: "",
        depositMethod: 0,
        transactionPurposeList: "",
        transactionImageEvents: "",
        accountNumber: "",
        mobileNumber: "",
        systemreferencenumber: "",
        transactionPurposeId: "",
        transactionPurposeText: "",
        billingCategory: "",
        billingCompanyCode: "",
        billingCompanyId: "",
        billingCompanyName: "",
        bankCode: "",
        bankId: "",
        bankIMD: "",
        bankName: "",
        enteredAmount: "",
        accountTitle: "",
        transactionNumber: "",
        transactionStatus: "",
        valueLimit: "",
        statusCode: "",
        denominationsStacked: false,
        counterDenominations: "",
        company: {
            code: "",
            id: ""

        },
        ownAccountsList: Object,
        authorizedDenominations: Object,
        depositorRequired: "",
        biometricRequired: true,
        cancellationPending: false,
        cashAcceptorIsBusy: false,
        startingComponent: "",
        skippingReceipt: false,
        chequeImage: "",
        state: {
            screens: {
                cd_other_beneficiary_detail: {
                    fields: {
                        account_num_changed: true
                    }
                },
                cd_other_transaction_detail_last_step: 1
            }
        },
        isSubTransaction: false,
        isCashStuck: false,
        claimId: "",
        claimAmount: "",
        claimDenominations: "",
        chequeAlreadyEjected: false,
        camSnapShots: {
            transactionInput: WebcamImage,
            atSubmiittingCash: WebcamImage,
            atPrintReceipt: WebcamImage
        },
        responseBehavior: {
            isSuccess: false,
            printSlip: true,
            openEscrow: false,
            navigateTo: "",
            errorMessage: ""
        }

    };

    static transactionTypes = {
        _OWN_ACCOUNT: 1,
        _ANOTHER_ACCOUNT: 2,
        _INTERBANK_ACCOUNT: 3
    }

    static dialogType = {
        _SPINNER: 1,
        _MESSAGE: 2,
        _CONFIRMATION: 3,
        _BIO_VERIFICATION: 4,

        _REMAINING_AMOUNT: 5,
        _CASH_DEPOSIT: 6,
        _RETRY_CANCEL: 7
    }
    static dialogIcon = {
        _INFO: 1,
        _ERROR: 2,
        _SUCCESS: 3,
        _WARNING: 4,
        _CONFIRMATION: 5,
        _LOADING: 6

    }

    static depositMethods = {
        _CASH: 1,
        _CHEQUE: 2,
        _CASH_BILL_PAYMENT: 3,
        _CASH_VAS_MOBILE_TOPUP: 4
    }



    //MANAGEMENT

    static applicationUser: any;

    //LEDs
    static ledArray = {
        _LED_BIOMETRIC: "BiometricLED",
        _LED_CASH_ACCEPTOR: "CashAcceptorLED",
        _LED_CHEQUE_ACCEPTOR: "ChequeAcceptorLED",
        _LED_RECEIPT_PRINTER: "ReceiptPrinterLED",
        _LED_OPTION_BLINK: 1,

        _LED_OPTION_OFF: 0
    }
    static labeling: any;
    static speechObj: any;

    static setLabeling(data: any) {
        this.labeling = data;
    }

    static getLabeling() {
        return this.labeling;
    }

}
