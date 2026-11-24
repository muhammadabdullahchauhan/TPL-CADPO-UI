import { WebcamImage } from "ngx-webcam";
import { ApplicationData } from "./application";
import { WebResponseService } from "../web-response.service";
import { DataService } from "./DataService";

 ;

export function performCancelTransaction() {

    clearTransactionSession();
    logoutCustomer();
}



export function initializeEnvironment(apiResponse: any, ejService: DataService, callback: Function) {



    // if (ApplicationData.config.jwtToken == "") {

    //     apiResponse.getTWARE_JWT().subscribe((data) => {
    //         subscribedLog("out-of-service.component.ts", "Requested JWT", data);
    //         if (data["code"] == "0000") { //SUCCESS
    //             if (data["message"] != "") {
    //                 ApplicationData.config.jwtToken = data["message"];
    //             }
    //         }
    //         else {
    //             sessionStorage.setItem("checkEnvironment", "11");
    //         }
    //     }, (error) => {

    //         if (ApplicationData.perefernces.pendingReset) {
    //             apiResponse.getTWARE_JWT().subscribe((data) => {
    //                 if (data['code'] = "0000") {
    //                     ApplicationData.perefernces.pendingReset = false;
    //                 }
    //             });
    //         }

    //         sessionStorage.setItem("checkEnvironment", "11");
    //     });
    // }

    apiResponse.getTWARE_NETWORK_STATUS().subscribe((responseNetwork) => {

        consoleLog("out-of-service.component.ts", "Requested Netowork Status", responseNetwork);
        if (responseNetwork["code"] == "0000") { //SUCCESS

            if (ApplicationData.config.deviceCode == "" ||
                ApplicationData.config.ipAddress == "" ||
                ApplicationData.config.officeName == "") {



                apiResponse.getTWARE_DEVICE_AUTH().subscribe((responseAuth) => {
                    consoleLog("out-of-service.component.ts", "Requested Device Auth", responseAuth);

                    if (responseAuth["code"] == "0000" || responseAuth["code"] == "DEV_AUTH_0000") { //SUCCESS
                        ApplicationData.config.deviceCode = responseAuth["data"]["terminalCode"];
                        ApplicationData.config.ipAddress = responseAuth["data"]["ipAddress"];

                        ApplicationData.config.officeName = responseAuth["data"]["officeName"];
                        ApplicationData.config.branchCode = responseAuth["data"]["branchCode"];
                        //    ApplicationData.config.QToken = responseAuth["data"]["qServiceToken"];
                        ApplicationData.config.heartbeatInterval = responseAuth["data"]["heartbeatInterval"];
                        ApplicationData.config.sessionInterval = responseAuth["data"]["sessionInterval"];
                        ApplicationData.config.cashTimeout = responseAuth["data"]["cashAcceptInterval"];
                        ApplicationData.config.chequeTimeout = responseAuth["data"]["chequeAcceptInterval"];

                        ApplicationData.config.currentInterval = ApplicationData.config.sessionInterval;
                        apiResponse.getDenominationAuthorization().subscribe((denomAuthResponse: any) => {
                            consoleLog("GlobalFunctions.ts", "Response Authorized Denominations", denomAuthResponse);
                            if (denomAuthResponse["statusCode"] == "00") {
                                ApplicationData.sessionTransaction.authorizedDenominations = denomAuthResponse['data'];
                              //  callback(true);

                              apiResponse.getLanguages()?.subscribe((data: any) => {
                                if(data['statusCode'] == "00") {
                                    ApplicationData.perefernces.languages = data['data'];
                
                                    for (let language of data['data']) {
                                        if (language['isDefault'] == true) {
                                            apiResponse.getLangMessages(language['languageCode']).subscribe((messages) => {
                                                WebResponseService.messages = {
                                                    ...messages
                                                }
                    
                                                apiResponse.getLangLabels(language['languageCode']).subscribe((labels) => {
                                                    ApplicationData.labeling = {
                                                        ...labels
                                                    }
                                                });
                    
                                            });
                                        }
                                    }
                                    setTimeout(() => {
                                        callback(true);
                                    }, 2000);
                                }
                                else {
                                    callback(false);
                                }
                            }, err => {
                                callback(false);
                            });
                            }
                            else {
                                sessionStorage.setItem("checkEnvironment", "13");
                                callback(false);
                            }
                        }, err => {
                            sessionStorage.setItem("checkEnvironment", "13");
                            callback(false);
                        });


                    }
                    else {
                        ejService.subject.next("OFFLINE");
                        sessionStorage.setItem("checkEnvironment", "12");
                        callback(false);
                    }
                }, (error) => {
                    ejService.subject.next("OFFLINE");
                    sessionStorage.setItem("checkEnvironment", "12");
                    callback(false);
                });


            }

            if (
                ApplicationData.config.deviceCode != "" &&
                ApplicationData.config.ipAddress != "" &&
                ApplicationData.config.officeName != ""

            ) {
                sessionStorage.setItem("checkEnvironment", "00");
                apiResponse.getDenominationAuthorization().subscribe((denomAuthResponse: any) => {
                    consoleLog("GlobalFunctions.ts", "Response Authorized Denominations", denomAuthResponse);
                    if (denomAuthResponse["statusCode"] == "00") {
                        ApplicationData.sessionTransaction.authorizedDenominations = denomAuthResponse['data'];
                        callback(true);
                    }
                    else {
                        sessionStorage.setItem("checkEnvironment", "12");
                    }
                }, err => {
                    sessionStorage.setItem("checkEnvironment", "12");
                });

            }
        }
        else {
            sessionStorage.setItem("checkEnvironment", "21");
            callback(false);
        }
    }, err => {
        callback(false);
    });


}



export function logoutCustomer() {

    clearCustomerAuthorization();


    ApplicationData.customer.CNIC = "";
    // ApplicationData.customer.collectedAmount = 0;

}

export function validateLogin(): boolean {
    writeEJLine("Validating Customer");
    if (ApplicationData.customer.CNIC != "") {
        return true;
    }
    else {
        return false;
    }
}

export function validateAuthorization() {
    return ApplicationData.customer.authorized;
}

export function clearCustomerAuthorization() {
    ApplicationData.customer.authorized = false;
}

export function authorizeCustomer() {
    ApplicationData.customer.authorized = true;
}
export function clearTransactionSession() {
    ApplicationData.sessionTransaction.accountNumber = "";
    ApplicationData.sessionTransaction.mobileNumber = "";
    ApplicationData.sessionTransaction.transactionPurposeId = "";
    ApplicationData.sessionTransaction.transactionPurposeText = "";
    ApplicationData.sessionTransaction.enteredAmount = "";
    ApplicationData.sessionTransaction.transactionImageEvents = "";
    ApplicationData.sessionTransaction.accountTitle = "";
    ApplicationData.sessionTransaction.transactionTitle = "";
    ApplicationData.sessionTransaction.transactionNumber = "";
    ApplicationData.sessionTransaction.transactionStatus = "";
    ApplicationData.sessionTransaction.ownAccountsList = Object;
    ApplicationData.sessionTransaction.transactionData = Object;
    ApplicationData.sessionTransaction.camSnapShots.transactionInput = WebcamImage;
    ApplicationData.sessionTransaction.camSnapShots.atSubmiittingCash = WebcamImage;
    ApplicationData.sessionTransaction.camSnapShots.atPrintReceipt = WebcamImage;
    ApplicationData.sessionTransaction.responseBehavior.errorMessage = "";
    ApplicationData.sessionTransaction.responseBehavior.navigateTo = "";
    ApplicationData.sessionTransaction.valueLimit = "";
    ApplicationData.sessionTransaction.chequeImage = "";
    ApplicationData.sessionTransaction.parsedChequeData = null;
    ApplicationData.sessionTransaction.isChequeParsed = false;
    ApplicationData.sessionTransaction.isSubTransaction = false;
    ApplicationData.sessionTransaction.isCashStuck = false;
    ApplicationData.sessionTransaction.claimId = "";
    ApplicationData.sessionTransaction.claimAmount = "";
    ApplicationData.sessionTransaction.claimDenominations = "";
    ApplicationData.sessionTransaction.chequeAlreadyEjected = false;
    ApplicationData.sessionTransaction.systemreferencenumber = "";
    ApplicationData.perefernces.transactionPerformed = false;
    ApplicationData.perefernces.pendingResponse = false;
    ApplicationData.sessionTransaction.state.screens.cd_other_transaction_detail_last_step = 1;


    ApplicationData.sessionTransaction.responseBehavior.isSuccess = false;
    ApplicationData.sessionTransaction.responseBehavior.openEscrow = false;
    ApplicationData.sessionTransaction.responseBehavior.printSlip = false;
    sessionStorage.removeItem("chequeNo");
    sessionStorage.removeItem("currentAmount");
    sessionStorage.removeItem("denomText");
    sessionStorage.removeItem("currentDenom"); 
    sessionStorage.removeItem('selectedCompany');
    sessionStorage.removeItem('selectedCategory');
    sessionStorage.removeItem('selectedBank');
    sessionStorage.removeItem('selectedCategory');

    // Added for Utility Bill Payment

}

export function setAccountNumber(value) {
    ApplicationData.sessionTransaction.accountNumber = value;
}
export function getAccountNumber() {
    return ApplicationData.sessionTransaction.accountNumber;
}


export function setMobileNumber(value) {
    ApplicationData.sessionTransaction.mobileNumber = value;
}
export function getMobileNumber() {
    return ApplicationData.sessionTransaction.mobileNumber;
}

export function setTransactionPurposeId(value) {
    ApplicationData.sessionTransaction.transactionPurposeId = value;
}
export function getTransactionPurposeId() {
    return ApplicationData.sessionTransaction.transactionPurposeId;
}

export function setTransactionPurposeText(value) {
    ApplicationData.sessionTransaction.transactionPurposeText = value;
}
export function getTransactionPurposeText() {
    return ApplicationData.sessionTransaction.transactionPurposeText;
}

export function setEnteredAmount(value) {
    ApplicationData.sessionTransaction.enteredAmount = value;
}
export function getEnteredAmount() {
    return ApplicationData.sessionTransaction.enteredAmount;
}

export function setAccountTitle(value) {
    ApplicationData.sessionTransaction.accountTitle = value;
}
export function getAccountTitle() {
    return ApplicationData.sessionTransaction.accountTitle;
}

export function setTransactionNumber(value) {
    ApplicationData.sessionTransaction.transactionNumber = value;
}
export function getTransactionNumber() {
    return ApplicationData.sessionTransaction.transactionNumber;
}

export function setTransactionStatus(value) {
    console.log("Setting Trans 1144:" + value);
    ApplicationData.sessionTransaction.transactionStatus = value;
}
export function getTransactionStatus() {
    return ApplicationData.sessionTransaction.transactionStatus;
}

export function setTransactionStatusCode(value) {
    console.log("Setting Trans 1144:" + value);
    ApplicationData.sessionTransaction.statusCode = value;
}
export function getTransactionStatusCode() {
    return ApplicationData.sessionTransaction.statusCode;
}

export function setTransactionType(value) {
    ApplicationData.sessionTransaction.transactionType = value;
}

export function getTransactionType() {
    return ApplicationData.sessionTransaction.transactionType;
}

export function setCDMReferenceNumber(value) {
    ApplicationData.sessionTransaction.cdmReferenceNumber = value;
}

export function getCDMReferenceNumber() {
    return ApplicationData.sessionTransaction.cdmReferenceNumber;
}

export function setTransactiontTitle(value) {
    ApplicationData.sessionTransaction.transactionTitle = value;
}

export function setTransactionData(value) {
    ApplicationData.sessionTransaction.transactionData = value;
}

export function getTransactionData() {
    return ApplicationData.sessionTransaction.transactionData;
}

export function getTransactiontTitle() {
    return ApplicationData.sessionTransaction.transactionTitle
}

export function setDepositMethod(value) {
    ApplicationData.sessionTransaction.depositMethod = value;
}

export function getDepositMethod() {
    return ApplicationData.sessionTransaction.depositMethod
}

export function setChequeNo(value) {
    ApplicationData.sessionTransaction.chequeNo = value;
}

export function getChequeNo() {
    return ApplicationData.sessionTransaction.chequeNo
}

export function setbillingCategory(value) {
    ApplicationData.sessionTransaction.billingCategory = value;
}

export function getbillingCategory() {
    return ApplicationData.sessionTransaction.billingCategory
}

export function setBillingCompaniesData(value) {
    ApplicationData.sessionTransaction.billingCompaniesData = value;
}

export function getBillinCompaniesData() {
    return ApplicationData.sessionTransaction.billingCompaniesData;
}

export function setbillingCompanyName(value) {
    ApplicationData.sessionTransaction.billingCompanyName = value;
}

export function getbillingCompanyName() {
    return ApplicationData.sessionTransaction.billingCompanyName
}

export function setbillingCompanyCode(value) {
    ApplicationData.sessionTransaction.billingCompanyCode = value;
}

export function getbillingCompanyCode() {
    return ApplicationData.sessionTransaction.billingCompanyCode
}

export function setbillingCompanyId(value) {
    ApplicationData.sessionTransaction.billingCompanyId = value;
}

export function getbillingCompanyId() {
    return ApplicationData.sessionTransaction.billingCompanyId
}

export function setOuterSteps(value) {
    ApplicationData.sessionTransaction.outerSteps = value;
}

export function getOuterSteps() {
    return ApplicationData.sessionTransaction.outerSteps
}





export function setbankName(value) {
    ApplicationData.sessionTransaction.bankName = value;
}

export function getbankName() {
    return ApplicationData.sessionTransaction.bankName
}

export function setbankCode(value) {
    ApplicationData.sessionTransaction.bankCode = value;
}

export function getbankCode() {
    return ApplicationData.sessionTransaction.bankCode
}

export function setbankId(value) {
    ApplicationData.sessionTransaction.bankId = value;
}

export function getbankId() {
    return ApplicationData.sessionTransaction.bankId
}

export function setbankIMD(value) {
    ApplicationData.sessionTransaction.bankIMD = value;
}

export function getbankIMD() {
    return ApplicationData.sessionTransaction.bankIMD
}


export function setTransactionResponseBehavior(isSuccess: boolean, printSlip: boolean, openEscrow: boolean, navigateTo: any, errorMessage: string) {
    ApplicationData.sessionTransaction.responseBehavior.isSuccess = isSuccess;
    ApplicationData.sessionTransaction.responseBehavior.printSlip = printSlip;
    ApplicationData.sessionTransaction.responseBehavior.openEscrow = openEscrow;
    ApplicationData.sessionTransaction.responseBehavior.navigateTo = navigateTo;
    ApplicationData.sessionTransaction.responseBehavior.errorMessage = errorMessage;
}




export function consoleLog(source: any, mesage: any, response: any = null) {
    if (ApplicationData.log.message && ApplicationData.log.response && response != null) {
        console.log(mesage + " /" + source);

        console.log(response);
    }
    else if (ApplicationData.log.message) {
        console.log(mesage + " /" + source);
    }

    else if (WebResponseService.settings.log_response) {
        console.log(response);
    }
}

export function subscribedLog(source: any, mesage: any, response: any = null) {
    if (ApplicationData.log.subsribed && ApplicationData.log.message && ApplicationData.log.response && response != null) {
        console.log(mesage + " /" + source);

        console.log(response);
    }
    else if (ApplicationData.log.message) {
        console.log(mesage + " /" + source);
    }
}

export function methodCalls(message: any) {
    if (WebResponseService.settings && WebResponseService.settings.inner_calls) {
        console.log(message);
    }
}
export function clearTerminalData() {
    writeEJLine("Clearing Terminal Data");
    ApplicationData.config.deviceCode = "";
    ApplicationData.config.QToken = "";
    ApplicationData.config.ipAddress = "";
    ApplicationData.config.jwtToken = "";
    ApplicationData.config.officeName = "";
}

// export function setApplicationUser(data: any) {
//     writeEJLine("Logging into Supervisory");
//     if (data["data"]["userTypeId"] == "1") {
//         ApplicationData.perefernces.superUser = false;
//     }
//     else {
//         ApplicationData.perefernces.superUser = true;
//         ApplicationData.perefernces.superUserId = data["data"]["userId"];
//     }
//     ApplicationData.applicationUser = {
//         ...data
//     }
// }

export function getApplicationUser() {
    return ApplicationData.applicationUser;
}

export function clearApplicationUser() {
    ApplicationData.applicationUser = null;
}

export function writeEJLine(message) {

    //console.info("EJ Logging: " + new Date().toLocaleString() + " => " + message.toUpperCase());


}

export function LogMethod(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
        const componentName = target.constructor.name;
        const methodName = propertyKey;

        if (WebResponseService.settings && WebResponseService.settings.log_component_methods == true) {
            console.log(`[${methodName}]:[${componentName}]`);
        }

        return originalMethod.apply(this, args);
    };

    return descriptor;
}

export function APICallLogger(target: any, propertyKey: string, descriptor: PropertyDescriptor) {



    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
        const componentName = target.constructor.name;
        const methodName = propertyKey;

        if (WebResponseService.settings && WebResponseService.settings.log_api_calls == true) {
            console.log(`API Call: [${methodName}]:[${componentName}]`);
        }



        return originalMethod.apply(this, args);
    };

    return descriptor;
}

export function checkSpecificDeviceHealth(deviceName:any):String {
    let healthData = ApplicationData.perefernces.terminalHealth;
    let statusHealth = "";
    Object.keys(healthData["data"]).forEach(key => {
        let sensorObj = healthData['data'][Number(key)];

        switch (sensorObj.deviceName) {
            case deviceName:
                console.log(sensorObj);
                statusHealth = sensorObj.status.health;
                break;
        
            default:
                break;
        }
      
    });
    return statusHealth;
}

// export function ifNetworkConnected(target: any, propertyKey: string, descriptor: PropertyDescriptor) {


//     const originalMethod = descriptor.value;
 
   
   
//     descriptor.value = function (...args: any[]) {
//       // Check network connectivity here
//       const isConnected = false; // Function to check network connectivity
  
  
  
//       if (!isConnected) {
//         console.error("Network not connected!"); // Log an error if network is not connected
//         return; // Return if network is not connected
//       }
  
//       // If network is connected, proceed with the original method execution
//       const result = originalMethod.apply(this, args);
//       return result;
//     };
  
//     return descriptor;
//   }

export function isCashStuckTransaction(): boolean {
    return ApplicationData.sessionTransaction.isCashStuck === true;
}

export function setCashStuckTransaction(value: boolean) {
    ApplicationData.sessionTransaction.isCashStuck = value;
}