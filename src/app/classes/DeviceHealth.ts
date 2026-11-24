import { Subscription } from "rxjs";
import { interval } from "rxjs/internal/observable/interval";
import { WebResponseService } from "../web-response.service";
import { ApplicationData } from "./application";
import { consoleLog, getDepositMethod,  subscribedLog } from "./GlobalFunctions";



let dropCashCall: boolean = false;
let errorOnce: boolean;
let intializeAttempt: number = 0;

let timer: Subscription;
let subcriptionCount = 0;
let cashAcceptorHealth: any;
let chequeAcceptorHealth: any;
let biometricHealth: any;
let acceptorData: any;
let doorSensorHealth: any;


export function getDeviceHealth(that: any, callType: Number, callback: Function, requiredDepositor: any, bioRequred: boolean = false): void  // call 0: Service // call 1: single check // call:3 set transaction call 4: collect cash screen
{



    stopStatusService();



    subcriptionCount++;
    that.apiResponse.checkTWARE_terminalHealth().subscribe((healthStatusResponse: any) => {

        if (WebResponseService.settings.log_interval == true && WebResponseService.settings.production_TAgent == true) {
            consoleLog("CashAcceptor.ts", "Requested Health", healthStatusResponse);
        }


        // if (WebResponseService.settings.production_TAgent == true) {
        //     that.apiResponse.postTerminalHealth(healthStatusResponse['data'], "Kiosk").subscribe((healthPostResponse: any) => {
        //         subscribedLog("CashAcceptor.ts", "Posted Device Health", healthPostResponse);
        //     });
        // }




        if (callType == 0 && (timer == null || timer.closed)) {
            startStatusService();
        }
        subscribedLog("CashAcceptor.ts", "Terminal Status", healthStatusResponse);
        that.heartbeat = {
            ...healthStatusResponse['data']
        }
        if (callType == 0) {
            that.spinnerStop();
        }
        for (let device of healthStatusResponse['data']) {
            let deviceName = device['deviceName'].toLowerCase();
            if (deviceName.includes("biometric")) {
                biometricHealth = device.status.health;
                if (biometricHealth != "OK") {
                    that.dataService.subject.next("Biometric Health: " + biometricHealth);
                }
            } else if (deviceName.includes("cash")) {

                cashAcceptorHealth = device.status.health;
                if (cashAcceptorHealth != "OK") {
                    that.dataService.subject.next("Cash Acceptor Health: " + cashAcceptorHealth);
                }
                acceptorData = device.status.info;
            }
            else if (deviceName.includes("cheque")) {


                chequeAcceptorHealth = device.status.health;
                if (chequeAcceptorHealth != "OK") {
                    that.dataService.subject.next("Cheque Acceptor Health: " + chequeAcceptorHealth);
                }
            }
            else if (deviceName.includes("printer")) {
                ApplicationData.perefernces.printerHealth = device.status.health;
                if (ApplicationData.perefernces.printerHealth != "OK" && callType == 3) {
                    that.dataService.subject.next("Printer Health: " + ApplicationData.perefernces.printerHealth);
                }

            } else if (deviceName.includes("door")) {
                doorSensorHealth = device.status.health;

            }

        }

        if (callType == 3) {
            if (bioRequred) {
                if (ApplicationData.sessionTransaction.biometricRequired && biometricHealth != "OK") {
                    that.dataService.subject.next("Bio Health on Error: " + biometricHealth);
                    that.biometricError();
                    return;
                }

            }
            if (requiredDepositor == "cheque") {
                if (chequeAcceptorHealth == "OK") {
                    callback(true);
                    return;
                }
                else {
                    callback(false);
                    return;
                }
            }

            if (requiredDepositor == "cash") {
                if (cashAcceptorHealth != "OK") {
                    callback(false);
                    return;
                }
                // LET CONTINUE CODE FOR CASH ACCEPTOR
            }

        }

        if (callType == 4 && requiredDepositor == "cheque") {

            if (cashAcceptorHealth == "OK") {
                that.dataService.subject.next("Waiting for cheque");
                that.acceptCheque();
            }
            else {
                that.dataService.subject.next("Cheque Acceptor is on error");
                that.deviceError();
            }

        }

        if (acceptorData.processStatus == 1 ||
            acceptorData.processStatus == 2 ||
            acceptorData.processStatus == 6) {

            if (callType == 0) {
                if (acceptorData.entryHasNotes == 1 && acceptorData.exitHasNotes == 1) {

                    // REMOVE NOTES FROM ENTRY/EXIT	
                    that.dialog(WebResponseService.messages.msg_remove_notes_entryexit.heading, WebResponseService.messages.msg_remove_notes_entryexit.message, ApplicationData.dialogType._MESSAGE, ApplicationData.dialogIcon._ERROR);
                }

                else if (acceptorData.entryHasNotes == 1) {

                    // REMOVE NOTES FROM ENTRY
                    that.dataService.subject.next("Entry has notes already");
                    that.dialog(WebResponseService.messages.msg_remove_notes_entry.heading, WebResponseService.messages.msg_remove_notes_entry.message, ApplicationData.dialogType._MESSAGE, ApplicationData.dialogIcon._ERROR);
                }

                else if (acceptorData.exitHasNotes == 1) {

                    // REMOVE NOTES FROM EXIT
                    that.dataService.subject.next("Exit has notes already");
                    if (callType == 1) {
                        that.dialog(WebResponseService.messages.msg_remove_notes_exit.heading, WebResponseService.messages.msg_remove_notes_exit.message, ApplicationData.dialogType._MESSAGE, ApplicationData.dialogIcon._ERROR);

                    }
                    else {
                        that.dialog(WebResponseService.messages.msg_remove_notes_exit.heading, WebResponseService.messages.msg_remove_notes_exit.message, ApplicationData.dialogType._MESSAGE, ApplicationData.dialogIcon._ERROR);

                    }
                }

                if (localStorage.getItem("refreshed") == "outoforder") {
                    timer.unsubscribe();
                    // subscribedLog("CashAcceptor.ts", "Cash Acceptor Status(Un-subscribed)");
                    const source = interval(500);
                    //  observeLanguage = source.subscribe(val => loadApp());
                  //  that.dataService.subject.next("IN SERVICE\n");
                    ApplicationData.perefernces.healthCall = false;
                    that.navigateToScreen("home");
                }
            }
            else if (callType == 3) {

                ApplicationData.perefernces.healthCall = false;

                if (acceptorData.escrowHasNotes == 1 || acceptorData.escrowHasNotes == 2) {
                    if (!dropCashCall) {
                        that.apiResponse.acceptorStack().subscribe((response: any) => {
                            subscribedLog("CashAcceptor.ts", "Requested Drop Cash", response);

                            if (response["code"] == "0000") {
                                that.apiResponse.updateMachineCounter(ApplicationData.sessionTransaction.counterDenominations)?.subscribe((res: any) => {
                                    consoleLog("CashAcceptor.ts", "Response updateMachineCounter", res);
                                    if (res["code"] == "0000") {
                                        //  that.navigateToScreen("transaction");
                                        callback(true);
                                        return;
                                    }
                                    else {
                                        that.writeEJ("ERROR IN UPDATING COUNTER");
                                        //  that.navigateToScreen("out-of-service");
                                        callback(false);
                                        return;
                                    }


                                }, err => {
                                    that.writeEJ("ERROR IN UPDATING COUNTER");
                                    //   that.navigateToScreen("out-of-service");
                                    callback(false);
                                    return;
                                });
                            }
                            else {
                                that.writeEJ("ERROR IN REJECTING CASH");
                                ApplicationData.perefernces.criticallyOutService = true;
                                that.navigateToScreen("out-of-service");
                                callback(false);
                                return;
                            }//

                        }, (error: any) => {
                        }).add(() => {
                            that.writeEJ("ERROR IN REJECTING CASH");
                            dropCashCall = true;
                            getDeviceHealth(that, 0, (res: any) => { }, "");
                        })
                    }
                    else {
                        if (localStorage.getItem("refreshed") == "idle") {
                            //   that.navigateToScreen("out-of-service");
                            callback(false);
                            return;
                        }
                    }
                }
                else {

                    // that.navigateToScreen("transaction");
                    callback(true);
                    return;
                }


            }

            else if (callType == 4) {
                if (getDepositMethod() == ApplicationData.depositMethods._CASH || getDepositMethod() == ApplicationData.depositMethods._CASH_BILL_PAYMENT) {

                    if (acceptorData.escrowHasNotes == 2) {
                        that.dataService.subject.next("Escrow is Full");
                        that.escrowFullError();
                        ApplicationData.perefernces.criticallyOutService = true;
                        that.navigateToScreen("out-of-service");
                    }
                    else {
                        that.acceptCash();
                    }

                }
                // else if (getDepositMethod() == ApplicationData.depositMethods._CHEQUE) {
                //     that.dataService.subject.next("Waiting for cheque");
                //     that.acceptCheque();
                // }
            }
        }
        else {
            if (errorOnce) {
                errorOnce = false;
                if (localStorage.getItem("refreshed") == "idle") {
                    ApplicationData.perefernces.criticallyOutService = true;
                    that.navigateToScreen("out-of-service");
                }
            }
            else {
                errorOnce = true;
                getDeviceHealth(that, 1, (res: any) => { }, "");
            }

        }
       
        ApplicationData.perefernces.healthCall = false;
        subcriptionCount--;
    }, (error: any) => {
     

        ApplicationData.perefernces.healthCall = false;
        subcriptionCount--;
        that.apiData = error?.error;
        if (error?.error["code"] == "9999") {
            if (callType == 0 && (timer == null || timer.closed)) {
                startStatusService();
            }
            if (localStorage.getItem("refreshed") == "idle") {
                ApplicationData.perefernces.criticallyOutService = true;
                that.navigateToScreen("out-of-service");
            }
        }
        else {
            if (intializeAttempt == 0) {
                intializeAttempt = 1;
                that.apiResponse.initializeCashAcceptor().subscribe((responseInitiateAcceptor: any) => {
                    that.dataService.subject.next("Re-Initializing Cash Acceptor");
                    consoleLog("CashAcceptor.ts", "Initiate Acceptor", responseInitiateAcceptor);
                    if (responseInitiateAcceptor["code"] != "0000") {
                        if (localStorage.getItem("refreshed") == "idle") {
                            ApplicationData.perefernces.criticallyOutService = true;
                            that.navigateToScreen("out-of-service");
                        }
                    }
                    else {
                        if (callType == 0 && (timer == null || timer.closed)) {
                            startStatusService();
                        }
                    }

                }, err => {
                    ApplicationData.perefernces.criticallyOutService = true;
                    that.navigateToScreen("out-of-service");
                });
            }
            else {

            }
        }
    });


    function loadApp() {
        if (ApplicationData.labeling) {
            that.spinnerStop();
            that.navigateToScreen("home");
        }
    }

    function startStatusService() {
        return;
        timer = interval(Number(ApplicationData.config.heartbeatInterval)).subscribe((x => {

            getDeviceHealth(that, 0, (res: any) => { }, "");
        }));
    }


}

export function stopStatusService() {
    try {
        timer.unsubscribe();
    } catch (error) {

    }
}

